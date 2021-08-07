import React from "react";
import TextField from '@material-ui/core/TextField';
import {mapListValues, listValuesToArray} from "../../../../utils/stuff";
import {mergeListValues, listValueToOption, getListValue} from "../../../../utils/autocomplete";
import FormControl from "@material-ui/core/FormControl";
import omit from "lodash/omit";
import debounce from "lodash/debounce";
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';



const defaultFilterOptions = createFilterOptions();





export default ({
  asyncFetch, useLoadMore, useAsyncSearch, forceAsyncSearch,
  asyncListValues: selectedAsyncListValues, 
  listValues: staticListValues, allowCustomValues,
  value: selectedValue, setValue, placeholder, customProps, readonly, config
}) => {
  // setings
  const {defaultSliderWidth} = config.settings;
  const {width, ...rest} = customProps || {};
  const customInputProps = rest.input || {};
  const customAutocompleteProps = omit(rest.autocomplete || rest, ["showSearch"]);
  const loadMoreTitle = `Load more...`;
  const loadingMoreTitle = `Loading more...`;
  const aPlacaholder = forceAsyncSearch ? 'Type to search' : placeholder;
  const fetchonInputDebounce = 0;

  // state
  const [open, setOpen] = React.useState(false);
  const [asyncFetchMeta, setAsyncFetchMeta] = React.useState(undefined);
  const [loadingCnt, setLoadingCnt] = React.useState(0);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [asyncListValues, setAsyncListValues] = React.useState(undefined);

  // ref
  const asyncFectchCnt = React.useRef(0);
  const componentIsMounted = React.useRef(true);
  const isSelectedLoadMore = React.useRef(false);

  // compute
  const nSelectedAsyncListValues = listValuesToArray(selectedAsyncListValues);
  const listValues = asyncFetch ? 
    (!allowCustomValues ? mergeListValues(asyncListValues, nSelectedAsyncListValues, true) : asyncListValues) :
    staticListValues;
  const isDirtyInitialListValues = asyncListValues == undefined && selectedAsyncListValues && selectedAsyncListValues.length && typeof selectedAsyncListValues[0] != "object";
  const isLoading = loadingCnt > 0;
  const isInitialLoading = open && asyncFetch && (
    listValues === undefined && !forceAsyncSearch || 
    useAsyncSearch && isDirtyInitialListValues
  );
  const canLoadMore = !isInitialLoading && listValues && listValues.length > 0 && asyncFetchMeta && asyncFetchMeta.hasMore;
  const canShowLoadMore = !isLoading && canLoadMore;
  const options = mapListValues(listValues, listValueToOption);
  const hasValue = selectedValue != null;
  //const selectedListValue = hasValue ? getListValue(selectedValue, listValues) : null;
  //const selectedOption = listValueToOption(selectedListValue);
  
  // fetch
  const fetchListValues = async (filter = null, isLoadMore = false) => {
    // clear obsolete meta
    if (!isLoadMore && asyncFetchMeta) {
      setAsyncFetchMeta(undefined);
    }

    const offset = isLoadMore && asyncListValues ? asyncListValues.length : 0;
    const meta = isLoadMore && asyncFetchMeta;

    const newAsyncFetchCnt = ++asyncFectchCnt.current;
    const res = await asyncFetch(filter, offset, meta);
    const isFetchCancelled = asyncFectchCnt.current != newAsyncFetchCnt;
    if (isFetchCancelled || !componentIsMounted.current) {
      return null;
    }

    const {values, hasMore, meta: newMeta} = res && res.values ? res : {values: res};
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
      ...(assumeHasMore != null ? {hasMore: assumeHasMore} : {}),
      ...(hasMore != null ? {hasMore} : {}),
      ...(newMeta != null ? newMeta : {}),
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
  const loadListValuesDebounced = React.useCallback(debounce(loadListValues, fetchonInputDebounce), []);

  // Unmount
  React.useEffect(() => {
    return () => {
      componentIsMounted.current = false;
    };
  }, []);

  // Initial loading
  React.useEffect(() => {
    if (isInitialLoading && loadingCnt == 0) {
      console.log(6)
      (async () => {
        await loadListValues();
      })();
    }
  }, [isInitialLoading]);

  // Event handlers
  const onOpen = () => setOpen(true);
  const onClose = (_e) => {
    if (isSelectedLoadMore.current) {
      isSelectedLoadMore.current = false;
    } else {
      setOpen(false);
    }
  }

  const onChange = async (_e, option) => {
    if (option && option.specialValue == 'LOAD_MORE') {
      isSelectedLoadMore.current = true;
      await loadListValues(inputValue, true);
    } else if (option && option.specialValue == 'LOADING_MORE') {
      isSelectedLoadMore.current = true;
    } else {
      setValue(option == null ? undefined : option.value, [option]);
    }
  };

  const onInputChange = async (e, newInputValue) => {
    const val = newInputValue;
    //const isTypeToSearch = e.type == 'change';

    if (val === loadMoreTitle || val == loadingMoreTitle) {
      return;
    }

    setInputValue(val);

    if (allowCustomValues) {
      setValue(val, [val]);
    }

    const canSearchAsync = useAsyncSearch && (forceAsyncSearch ? !!val : true);
    if (canSearchAsync) {
      await loadListValuesDebounced(val);
    }
  };

  // Render
  const renderInput = (params) => {
    return (
      <TextField 
        {...params} 
        InputProps={{
          ...params.InputProps,
          readOnly: readonly,
          endAdornment: (
            <React.Fragment>
              {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
              {params.InputProps.endAdornment}
            </React.Fragment>
          ),
        }}
        disabled={readonly}
        placeholder={!readonly ? aPlacaholder : ""}
        //onChange={onInputChange}
        {...customInputProps}
      />
    );
  };
  const filterOptions = (options, params) => {
    const filtered = defaultFilterOptions(options, params);
    if (useLoadMore) {
      if (canShowLoadMore) {
        filtered.push({
          specialValue: 'LOAD_MORE',
          title: loadMoreTitle,
        });
      } else if (isLoadingMore) {
        filtered.push({
          specialValue: 'LOADING_MORE',
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
    const option = valueOrOption.value != undefined ? valueOrOption : 
      listValueToOption(getListValue(valueOrOption, listValues));
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

  return (
    <FormControl>
      <Autocomplete
        fullWidth
        style={{ width: width || defaultSliderWidth }}
        freeSolo={allowCustomValues}
        loading={isInitialLoading}
        open={open}
        onOpen={onOpen}
        onClose={onClose}
        inputValue={inputValue}
        onInputChange={onInputChange}
        label={!readonly ? aPlacaholder : ""}
        onChange={onChange}
        value={hasValue ? selectedValue : null} // should be simple value to prevent re-render!
        getOptionSelected={getOptionSelected}
        disabled={readonly}
        readOnly={readonly}
        options={options}
        getOptionLabel={getOptionLabel}
        getOptionDisabled={getOptionDisabled}
        renderInput={renderInput}
        filterOptions={filterOptions}
        {...customAutocompleteProps}
      ></Autocomplete>
    </FormControl>
  );
};
