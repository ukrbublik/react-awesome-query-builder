import React from "react";
import { Utils } from "@react-awesome-query-builder/core";
import debounce from "lodash/debounce";
const { mergeListValues, listValueToOption, optionToListValue, optionsToListValues, fixListValuesGroupOrder } = Utils.Autocomplete;
const { mapListValues, listValuesToArray, getListValue, makeCustomListValue, searchListValue, getItemInListValues } = Utils.ListUtils;

function sleep(delay) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

const useListValuesAutocomplete = ({
  asyncFetch, useLoadMore, useAsyncSearch, forceAsyncSearch, fetchSelectedValuesOnInit,
  asyncListValues: selectedAsyncListValues,
  listValues: staticListValues, allowCustomValues,
  value: selectedValue, setValue, placeholder, 
  config, field
}, {
  debounceTimeout,
  multiple,
  uif,
  isFieldAutocomplete,
  dontFixOptionsOrder,
}) => {
  const knownSpecialValues = ["LOAD_MORE", "LOADING_MORE"];
  const loadMoreTitle = config.settings.loadMoreLabel ?? "Load more...";
  const loadingMoreTitle = config.settings.loadingMoreLabel ?? "Loading more...";
  const aPlaceholder = forceAsyncSearch ? (config.settings.typeToSearchLabel ?? "Type to search") : placeholder;

  // Import from JsonLogic fills `asyncListValues`, but import from SQL/SpEL does not. It's workaround
  if (asyncFetch && fetchSelectedValuesOnInit && !selectedAsyncListValues && selectedValue != undefined) {
    selectedAsyncListValues = Array.isArray(selectedValue) ? selectedValue : [selectedValue];
  }

  // state
  const [open, setOpen] = React.useState(false);
  const [asyncFetchMeta, setAsyncFetchMeta] = React.useState(undefined);
  const [loadingCnt, setLoadingCnt] = React.useState(0);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [asyncListValues, setAsyncListValues] = React.useState(undefined);

  // ref
  const asyncFectchCnt = React.useRef(0);
  const componentIsMounted = React.useRef(0);
  const isSelectedLoadMore = React.useRef(false);
  const latestSelectedValue = React.useRef();
  latestSelectedValue.current = selectedValue;
  const latestInputValue = React.useRef();
  latestInputValue.current = inputValue;

  // compute
  const nSelectedAsyncListValues = React.useMemo(() => (
    listValuesToArray(selectedAsyncListValues)
  ), [
    selectedAsyncListValues,
  ]);
  // if selectedAsyncListValues is array of strings/numbers => needs to be resolved
  const areSelectedAsyncListValuesNotResolved = selectedAsyncListValues && Array.isArray(selectedAsyncListValues)
    && selectedAsyncListValues.filter(v => v !== null && typeof v !== "object").length > 0;
  const listValues = React.useMemo(() => (
    asyncFetch
      ? (selectedAsyncListValues ? mergeListValues(asyncListValues, nSelectedAsyncListValues, true) : asyncListValues)
      : listValuesToArray(staticListValues)
  ), [
    asyncFetch,
    selectedAsyncListValues,
    asyncListValues,
    staticListValues,
  ]);
  // todo: useMemo for calcing listValuesToDisplay ?
  let listValuesToDisplay = asyncFetch
    ? asyncListValues
    : listValuesToArray(staticListValues);
  if (allowCustomValues && inputValue && !searchListValue(inputValue, asyncListValues)) {
    listValuesToDisplay = mergeListValues(listValuesToDisplay, [makeCustomListValue(inputValue)], true);
  }
  if (asyncFetch && !asyncListValues && selectedAsyncListValues && !inputValue && !open && uif === "antd") {
    // for initial loading, to resolve "a" -> "A"
    listValuesToDisplay = listValues;
  }
  if (asyncFetch && !allowCustomValues && selectedAsyncListValues && uif === "mui") {
    // to prevent warning, when select A, search E -> A is missing in options
    //  MUI: The value provided to Autocomplete is invalid.
    //  None of the options match with `"a"`.
    //  You can use the `isOptionEqualToValue` prop to customize the equality test.
    listValuesToDisplay = mergeListValues(listValuesToDisplay, nSelectedAsyncListValues, true, true);
  }
  //const isDirtyInitialListValues = asyncListValues == undefined && selectedAsyncListValues && selectedAsyncListValues.length && typeof selectedAsyncListValues[0] != "object";
  const isLoading = loadingCnt > 0;
  const canInitialLoadSelected = fetchSelectedValuesOnInit && !open && asyncFetch
    && areSelectedAsyncListValuesNotResolved && selectedValue != null;
  const canFirstLoadOnOpened = open && asyncFetch
    && (asyncListValues === undefined)
    && (forceAsyncSearch ? inputValue : true);
  const isInitialLoading = (canFirstLoadOnOpened || canInitialLoadSelected) && isLoading;
  const canLoadMore = !isInitialLoading && listValues && listValues.length > 0
    && asyncFetchMeta && asyncFetchMeta.hasMore && (asyncFetchMeta.filter || "") === inputValue;
  const canShowLoadMore = !isLoading && canLoadMore;
  const options = mapListValues(listValuesToDisplay, listValueToOption);
  const hasValue = selectedValue != null;
  const selectedListValue = !multiple && hasValue ? getListValue(selectedValue, listValues) : null;
  // const selectedListValues = multiple && hasValue ? selectedValue.map(v => getItemInListValues(listValues, v)) : [];

  // fetch - search
  const fetchListValues = async (filter = null, isLoadMore = false) => {
    // clear obsolete meta
    if (!isLoadMore && asyncFetchMeta) {
      setAsyncFetchMeta(undefined);
    }

    const offset = isLoadMore && asyncListValues ? asyncListValues.length : 0;
    const meta = isLoadMore && asyncFetchMeta || !useLoadMore && { pageSize: 0 };

    const newAsyncFetchCnt = ++asyncFectchCnt.current;
    const res = await asyncFetch.call(config?.ctx, filter, offset, meta);
    const isFetchCancelled = asyncFectchCnt.current != newAsyncFetchCnt;
    if (isFetchCancelled || !componentIsMounted.current) {
      return null;
    }

    const { values, hasMore, meta: newMeta } = res?.values
      ? res
      : { values: res } // fallback, if response contains just array, not object
    ;
    const nValues = listValuesToArray(values);
    let assumeHasMore;
    let newValues;
    if (isLoadMore) {
      newValues = mergeListValues(asyncListValues, nValues, false);
      assumeHasMore = newValues.length > asyncListValues.length;
    } else {
      newValues = nValues;
      if (useLoadMore) {
        assumeHasMore = newValues.length > 0;
      }
    }

    // save new meta
    const realNewMeta = hasMore != null || newMeta != null || assumeHasMore != null ? {
      ...(assumeHasMore != null ? { hasMore: assumeHasMore } : {}),
      ...(hasMore != null ? { hasMore } : {}),
      ...(newMeta != null ? newMeta : {}),
      filter
    } : undefined;
    if (realNewMeta) {
      setAsyncFetchMeta(realNewMeta);
    }

    return newValues;
  };

  // fetch - selected values only
  const fetchSelectedListValues = async () => {
    const selectedValues = latestSelectedValue.current == null ? [] : (multiple ? latestSelectedValue.current : [latestSelectedValue.current]);
    if (!selectedValues.length) {
      return null;
    }

    const meta = { fetchSelectedValues: true };

    const newAsyncFetchCnt = ++asyncFectchCnt.current;
    const res = await asyncFetch.call(config?.ctx, selectedValues, -1, meta);
    const isFetchCancelled = asyncFectchCnt.current != newAsyncFetchCnt;
    if (isFetchCancelled || !componentIsMounted.current) {
      return null;
    }

    const { values: selectedListValues } = res?.values
      ? res
      : { values: res } // fallback, if response contains just array, not object
    ;
    const latestSelectedValues = latestSelectedValue.current == null ? [] : (multiple ? latestSelectedValue.current : [latestSelectedValue.current]);
    const nValues = latestSelectedValues.map(v => getItemInListValues(selectedListValues, v) ?? makeCustomListValue(v));

    return nValues.length ? nValues : null;
  };

  const loadSelectedListValues = async () => {
    setLoadingCnt(x => (x + 1));
    const list = await fetchSelectedListValues();
    if (!componentIsMounted.current) {
      return;
    }
    if (list != null) {
      setValue(latestSelectedValue.current, list);
    }
    setLoadingCnt(x => (x - 1));
  };

  const loadListValues = async (filter = null, isLoadMore = false) => {
    setLoadingCnt(x => (x + 1));
    setIsLoadingMore(isLoadMore);
    const list = await fetchListValues(filter, isLoadMore);
    if (!componentIsMounted.current) {
      return;
    }
    if (list != null) {
      // tip: null can be used for reject (eg, if user don't want to filter by input)
      setAsyncListValues(list);
    }
    setLoadingCnt(x => (x - 1));
    setIsLoadingMore(false);
  };
  const loadListValuesDebounced = React.useCallback(debounce(loadListValues, debounceTimeout), []);

  React.useEffect(() => {
    componentIsMounted.current++;
    // Unmount
    return () => {
      componentIsMounted.current--;
      // if (!componentIsMounted.current && field) {
      //   console.log(`Autocomplete for ${field} has been unmounted`)
      // }
    };
  }, []);

  React.useEffect(() => {
    // Initial loading
    if (canFirstLoadOnOpened && loadingCnt == 0) {
      (async () => {
        await loadListValues();
      })();
    }
    if (canInitialLoadSelected && loadingCnt == 0) {
      (async () => {
        await loadSelectedListValues();
      })();
    }
  }, [canFirstLoadOnOpened, canInitialLoadSelected, loadingCnt]);

  // Event handlers
  const onOpen = () => {
    setOpen(true);
  };

  const onClose = async (_e) => {
    const isLoadMoreClick = isSelectedLoadMore.current;
    if (isLoadMoreClick) {
      isSelectedLoadMore.current = false;
      if (multiple) {
        // required for MUI
        setOpen(false);
      }
    } else {
      setOpen(false);
    }

    if (uif === "mui" && !isLoadMoreClick) {
      // parity with Antd
      const resetValue = "";
      await onInputChange(null, resetValue, "my-reset");
    }
  };

  const onDropdownVisibleChange = (open) => {
    if (open) {
      onOpen();
    } else {
      onClose();
    }
  };

  const isSpecialValue = (option) => {
    const specialValue = option?.specialValue || option?.value;
    return knownSpecialValues.includes(specialValue);
  };

  const onChange = async (e, val, option) => {
    // todo: don't rely on 3rd param. check MUI 6
    const isClearingAll = multiple && uif === "mui" && option === "clear";
    // if user removes all chars in search, don't clear selected value
    const isClearingInput = !multiple && uif === "mui" && option === "clear" && e?.type === "change";
    const isClearingSingle = !multiple && uif === "mui" && option === "clear" && e?.type !== "change";
    if (uif === "mui") {
      option = val;
      if (multiple) {
        val = option.map(o => (o?.value ?? o));
      } else {
        val = option?.value ?? option;
      }
    }
    const specialValue = multiple && Array.isArray(option) && option.map(opt => opt?.specialValue).find(v => !!v)
      || option?.specialValue;
    if (multiple && val && !Array.isArray(val)) {
      val = [...(selectedValue || []), val];
      option = null;
    }
    const valHasDuplicates = multiple && val?.length && (new Set(val)).size !== val.length;
    const isBadCallAfterTokenization = multiple && uif === "antd" && e === null && option === null && valHasDuplicates;
    // if there are tags AND input and select is opened, clear input first
    const shouldIgnore = isClearingAll && val.length === 0 && inputValue && open
      || isClearingInput
      || isBadCallAfterTokenization;
    if (shouldIgnore) {
      return;
    }
    const isAddingCustomOptionFromSearch 
      = multiple
      && val.length && val.length > (selectedValue || []).length
      && val[val.length-1] == inputValue
      && !getListValue(inputValue, asyncListValues);

    if (specialValue == "LOAD_MORE") {
      setInputValue(inputValue);
      isSelectedLoadMore.current = true;
      await loadListValues(inputValue, true);
    } else if (specialValue == "LOADING_MORE") {
      isSelectedLoadMore.current = true;
    } else {
      if (multiple) {
        const [newSelectedValues, newSelectedListValues] = optionsToListValues(val, listValues, allowCustomValues);
        setValue(newSelectedValues, asyncFetch ? newSelectedListValues : undefined);
        if (isAddingCustomOptionFromSearch) {
          await sleep(0);
          await onInputChange(null, "", "my-reset");
        }
      } else {
        const [v, lvs] = optionToListValue(val, listValues, allowCustomValues);
        setValue(v, asyncFetch ? lvs : undefined);
        if (isClearingSingle && isFieldAutocomplete) {
          // Fix issue when dropdown stays visible after clicking "X"
          await sleep(0);
          setOpen(false);
        }
      }
    }
  };

  const onInputChange = async (e, newInputValue, eventType) => {
    // eventType=reset used by MUI on:
    // - (single) initial set, select option - e = null, newInputValue = selected  (+1 call before with e != null)
    // - (single/multi, -ACV) blur - e != null, newInputValue = ''
    // - (multiple v5, -ACV) blur - e = null, newInputValue = '' # unwanted
    // - (multiple) select option - e != null, newInputValue = ''
    // - (multiple v4) delete tag while searching - e = null, newInputValue = ''  # unwanted
    // - (multiple v4) select option while searching - e = null, newInputValue = ''  # unwanted

    const isRemoveOption = uif === "mui" && eventType === "removeOption" && newInputValue === "" && multiple;
    const isSelectOption = uif === "mui" && eventType === "selectOption" && newInputValue === "" && multiple;
    const isIgnoredBlur = uif === "mui" && !multiple && eventType === "blur" && newInputValue === selectedListValue?.title;
    const shouldIgnore = uif === "mui" && eventType === "reset"
    // && (
    //   e != null
    //   // for MUI 4 if search "A" and select any option -> should NOT reset search
    //   // for MUI 5 if search "A" and close -> let's hold search but hide, as it's done in antd
    //   || e === null && inputValue && multiple
    // )
      || isSelectOption || isRemoveOption || isIgnoredBlur
    ;
    const val = newInputValue;
    if (val === loadMoreTitle || val === loadingMoreTitle || shouldIgnore) {
      return;
    }

    if (uif === "mui" && !multiple && eventType === "selectOption" && newInputValue !== "") {
      // parity with Antd
      return;
    }

    if (newInputValue != inputValue) {
      setInputValue(val);

      const canSearchAsync = useAsyncSearch && (forceAsyncSearch ? !!val : true);
      if (canSearchAsync) {
        await loadListValuesDebounced(val);
      } else if (useAsyncSearch && forceAsyncSearch) {
        setAsyncListValues([]);
      }
    }
  };

  // Options
  const extendOptions = (options) => {
    const filtered = [...options];
    if (useLoadMore) {
      if (canShowLoadMore) {
        filtered.push({
          specialValue: "LOAD_MORE",
          title: loadMoreTitle,
        });
      } else if (isLoadingMore) {
        filtered.push({
          specialValue: "LOADING_MORE",
          title: loadingMoreTitle,
          disabled: true
        });
      }
    }
    return filtered;
  };

  const getOptionSelected = (option, valueOrOption) => {
    if (valueOrOption == null)
      return false;
    const selectedValue = valueOrOption.value != undefined ? valueOrOption.value : valueOrOption;
    return option.value === selectedValue;
  };

  const getOptionDisabled = (valueOrOption) => {
    return valueOrOption && valueOrOption.disabled;
  };

  const getOptionIsCustom = (valueOrOption) => {
    if (valueOrOption?.isCustom)
      return true;
    const val = valueOrOption?.value ?? valueOrOption;
    const lv = getListValue(val, listValues);
    return lv?.isCustom || (lv == null);
  };

  const getOptionLabel = (valueOrOption) => {
    if (valueOrOption == null)
      return null;
    const option = valueOrOption.value != undefined ? valueOrOption
      : listValueToOption(getListValue(valueOrOption, listValues));
    if (!option && valueOrOption.specialValue) {
      // special last 'Load more...' item
      return valueOrOption.title;
    }
    if (!option && allowCustomValues) {
      // there is just string value, it's not item from list
      return valueOrOption.toString();
    }
    if (!option) {
      // weird
      return valueOrOption.toString();
    }
    return option.title || option.label || option.value.toString(); // fallback to value
  };

  const fixedOptions = uif === "mui" && !dontFixOptionsOrder ? fixListValuesGroupOrder(options) : options;

  return {
    options: fixedOptions,
    listValues,
    hasValue,
    selectedListValue,

    open,
    onOpen,
    onClose,
    onDropdownVisibleChange,
    onChange,
    
    inputValue,
    onInputChange,
    canShowLoadMore,
    isInitialLoading,
    isLoading,
    isLoadingMore,
    isSpecialValue,

    extendOptions,
    getOptionSelected,
    getOptionDisabled,
    getOptionIsCustom,
    getOptionLabel,
    aPlaceholder,
  };
};

export default useListValuesAutocomplete;
