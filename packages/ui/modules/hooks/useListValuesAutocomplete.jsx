import React from "react";
import { Utils } from "@react-awesome-query-builder/core";
import debounce from "lodash/debounce";
const { mergeListValues, listValueToOption, getListValue } = Utils.Autocomplete;
const { mapListValues, listValuesToArray } = Utils.ListUtils;


const useListValuesAutocomplete = ({
  asyncFetch, useLoadMore, useAsyncSearch, forceAsyncSearch,
  asyncListValues: selectedAsyncListValues,
  listValues: staticListValues, allowCustomValues,
  value: selectedValue, setValue, placeholder
}, {
  debounceTimeout,
  multiple
}) => {
  const knownSpecialValues = ["LOAD_MORE", "LOADING_MORE"];
  const loadMoreTitle = "Load more...";
  const loadingMoreTitle = "Loading more...";
  const aPlaceholder = forceAsyncSearch ? "Type to search" : placeholder;

  // state
  const [open, setOpen] = React.useState(false);
  const [asyncFetchMeta, setAsyncFetchMeta] = React.useState(undefined);
  const [loadingCnt, setLoadingCnt] = React.useState(0);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [asyncListValues, setAsyncListValues] = React.useState(undefined);

  // ref
  const asyncFectchCnt = React.useRef(0);
  const componentIsMounted = React.useRef(true);
  const isSelectedLoadMore = React.useRef(false);

  // compute
  const nSelectedAsyncListValues = listValuesToArray(selectedAsyncListValues);
  const listValues = asyncFetch
    ? (!allowCustomValues ? mergeListValues(asyncListValues, nSelectedAsyncListValues, true) : asyncListValues)
    : staticListValues;
  //const isDirtyInitialListValues = asyncListValues == undefined && selectedAsyncListValues && selectedAsyncListValues.length && typeof selectedAsyncListValues[0] != "object";
  const isLoading = loadingCnt > 0;
  const canInitialLoad = open && asyncFetch
    && asyncListValues === undefined
    && (forceAsyncSearch ? inputValue : true);
  const isInitialLoading = canInitialLoad && isLoading;
  const canLoadMore = !isInitialLoading && listValues && listValues.length > 0
    && asyncFetchMeta && asyncFetchMeta.hasMore && (asyncFetchMeta.filter || "") === inputValue;
  const canShowLoadMore = !isLoading && canLoadMore;
  const options = mapListValues(listValues, listValueToOption);
  const hasValue = selectedValue != null;
  // const selectedListValue = hasValue ? getListValue(selectedValue, listValues) : null;
  // const selectedOption = listValueToOption(selectedListValue);

  // fetch
  const fetchListValues = async (filter = null, isLoadMore = false) => {
    // clear obsolete meta
    if (!isLoadMore && asyncFetchMeta) {
      setAsyncFetchMeta(undefined);
    }

    const offset = isLoadMore && asyncListValues ? asyncListValues.length : 0;
    const meta = isLoadMore && asyncFetchMeta || !useLoadMore && { pageSize: 0 };

    const newAsyncFetchCnt = ++asyncFectchCnt.current;
    const res = await asyncFetch(filter, offset, meta);
    const isFetchCancelled = asyncFectchCnt.current != newAsyncFetchCnt;
    if (isFetchCancelled || !componentIsMounted.current) {
      return null;
    }

    const { values, hasMore, meta: newMeta } = res && res.values ? res : { values: res };
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

  // Unmount
  React.useEffect(() => {
    return () => {
      componentIsMounted.current = false;
    };
  }, []);

  // Initial loading
  React.useEffect(() => {
    if (canInitialLoad && loadingCnt == 0 && asyncFectchCnt.current == 0) {
      (async () => {
        await loadListValues();
      })();
    }
  }, [canInitialLoad]);

  // Event handlers
  const onOpen = () => {
    setOpen(true);
  };

  const onClose = (_e) => {
    if (isSelectedLoadMore.current) {
      isSelectedLoadMore.current = false;
      if (multiple) {
        setOpen(false);
      }
    } else {
      setOpen(false);
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

  const onChange = async (_e, option) => {
    let specialValue = option?.specialValue || option?.value 
      || multiple && option.map(opt => opt?.specialValue || opt?.value).find(v => !!v);
    if (specialValue == "LOAD_MORE") {
      isSelectedLoadMore.current = true;
      await loadListValues(inputValue, true);
    } else if (specialValue == "LOADING_MORE") {
      isSelectedLoadMore.current = true;
    } else {
      if (multiple) {
        const options = option;
        let newSelectedListValues = options.map((o, i) => {
          const item = o.value != null ? o : getListValue(o, listValues);
          // AntDesign puts array of labels in `_e` (`option` is array of objects, but custom option is always `{}`)
          // MUI puts array of labels in `option`
          const customItem = allowCustomValues && !item ? (Array.isArray(_e) ? _e[i] : o) : null;
          return item || customItem;
        });
        let newSelectedValues = newSelectedListValues
          .filter(o => o !== undefined)
          .map(o => (o.value !== undefined ? o.value : o));
        if (!newSelectedValues.length)
          newSelectedValues = undefined; //not allow []
        setValue(newSelectedValues, newSelectedListValues);
      } else {
        const v = option == null ? undefined : option.value;
        setValue(v, [option]);
      }
    }
  };

  const onInputChange = async (_e, newInputValue) => {
    const val = newInputValue;
    //const isTypeToSearch = e.type == 'change';

    if (val === loadMoreTitle || val === loadingMoreTitle) {
      return;
    }

    setInputValue(val);

    if (allowCustomValues) {
      if (multiple) {
        //todo
      } else {
        setValue(val, [val]);
      }
    }

    const canSearchAsync = useAsyncSearch && (forceAsyncSearch ? !!val : true);
    if (canSearchAsync) {
      await loadListValuesDebounced(val);
    } else if (useAsyncSearch && forceAsyncSearch) {
      setAsyncListValues([]);
    }
  };

  // to keep compatibility with antD
  const onSearch = async (newInputValue) => {
    if (newInputValue === "" && !open) {
      return;
    }

    await onInputChange(null, newInputValue);
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
      return null;
    const selectedValue = valueOrOption.value != undefined ? valueOrOption.value : valueOrOption;
    return option.value === selectedValue;
  };

  const getOptionDisabled = (valueOrOption) => {
    return valueOrOption && valueOrOption.disabled;
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
      return valueOrOption;
    }
    if (!option) {
      // weird
      return valueOrOption;
    }
    return option.title;
  };

  return {
    options,
    listValues,
    hasValue,

    open,
    onOpen,
    onClose,
    onDropdownVisibleChange,
    onChange,
    
    inputValue,
    onInputChange,
    onSearch,
    canShowLoadMore,
    isInitialLoading,
    isLoading,
    isLoadingMore,
    isSpecialValue,

    extendOptions,
    getOptionSelected,
    getOptionDisabled,
    getOptionLabel,

    // unused
    //selectedListValue,
    //selectedOption,
    aPlaceholder,
  };
};

export default useListValuesAutocomplete;
