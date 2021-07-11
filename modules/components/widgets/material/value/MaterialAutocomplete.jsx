import React from "react";
import TextField from '@material-ui/core/TextField';
import {mapListValues, listValuesToArray} from "../../../../utils/stuff";
import FormControl from "@material-ui/core/FormControl";
import omit from "lodash/omit";
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';


//todo: load more
//todo: after F5
//todo: humanStringFormat
//todo: initial values can be undefined until search
//todo: multi

//release: doc async, fetch

// todo: groupBy for field, test readonly


export default ({asyncListValues: selectedAsyncListValues, listValues: staticListValues, value: selectedValue, setValue, allowCustomValues, readonly, placeholder, customProps, config}) => {
  const async = true;

  // utils
  const mergeListValues = (values, selectedValues) => {
    if (!selectedValues)
      return values;
    const merged = selectedValues.reduce(
      (acc, v) => (acc.find(av => av.value == v.value) ? acc : [v, ...acc]), 
      values ? listValuesToArray(values) : []
    );
    return merged;
  };

  const listValueToOption = (lv) => {
    if (lv == null) return null;
    const {title, value} = lv;
    return {title, value};
  };

  const getListValue = (selectedValue) => 
    mapListValues(listValues, (lv) => (lv.value === selectedValue ? lv : null))
    .filter(v => v !== null)
    .shift();
  
  // fetch
  const fetchListValues = async (filter) => {
    function sleep(delay = 0) {
      return new Promise((resolve) => {
        setTimeout(resolve, delay);
      });
    }

    await sleep(1000*1);

    return [
      {title: 'A', value: 'a'},
      {title: 'AAA', value: 'aaa'},
      {title: 'B', value: 'b'},
      {title: 'C', value: 'c'}
    ]
    .filter(({title}) => filter == null ? true : title.indexOf(filter) != -1);
  };

  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [asyncListValues, setAsyncListValues] = React.useState(undefined);
  const listValues = async ? mergeListValues(asyncListValues, selectedAsyncListValues) : staticListValues;
  const isLoading = open && loading;
  const isInitialLoading = open && listValues === undefined;

  //todo: [p3] cancel last fetch
  const loadListValues = async (fetchFn) => {
    setLoading(true);
    const list = await fetchFn();
    if (list != null) {
      // tip: null can be used for reject (eg, if user don't want to filter by input)
      setAsyncListValues(list);
    }
    setLoading(false);
  };

  // Initial loading
  React.useEffect(() => {
    let active = true, loading = false;
    
    if (!isInitialLoading)
      return undefined;

    (async () => {
      if (active && !loading) {
        loading = true;
        await loadListValues(() => fetchListValues());
        loading = false;
      }
    })();

    return () => {
      active = false;
    };
  }, [isInitialLoading]);

  // setings
  const {defaultSliderWidth} = config.settings;
  const {width, ...rest} = customProps || {};
  const customInputProps = rest.input || {};
  const customAutocompleteProps = omit(rest.autocomplete || rest, ["showSearch"]);

  // options
  const getOptions = () => mapListValues(listValues, listValueToOption);
  const options = getOptions();

  // selected option
  const hasValue = selectedValue != null;
  const selectedListValue = hasValue ? getListValue(selectedValue) : null;
  const selectedOption = listValueToOption(selectedListValue);

  // on
  const onOpen = () => setOpen(true);
  const onClose = () => setOpen(false);

  const onChange = (_e, option) => {
    setValue(option == null ? undefined : option.value, [option]);
  };

  const onInputChange = async (e, newInputValue) => {
    let val = newInputValue;
    setInputValue(val);

    await loadListValues(() => fetchListValues(val));
  };

  // render
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
        placeholder={!readonly ? placeholder : ""}
        //onChange={onInputChange}
        {...customInputProps}
      />
    );
  };

  const getOptionSelected = (option, valueOrOption) => {
    if (valueOrOption == null)
      return null;
    const selectedValue = valueOrOption.value != undefined ? valueOrOption.value : valueOrOption;
    return option.value === selectedValue;
  };

  const getOptionLabel = (valueOrOption) => {
    if (valueOrOption == null)
      return null;
    const option = valueOrOption.value != undefined ? valueOrOption : listValueToOption(getListValue(valueOrOption));
    return option.title;
  }

  return (
    <FormControl>
      <Autocomplete
        //autoWidth
        //displayEmpty
        loading={isInitialLoading}
        style={{ width: width || defaultSliderWidth }}
        open={open}
        onOpen={onOpen}
        onClose={onClose}
        inputValue={inputValue}
        onInputChange={onInputChange}
        label={!readonly ? placeholder : ""}
        onChange={onChange}
        value={hasValue ? selectedValue : null} // should be simple value to prevent re-render!
        getOptionSelected={getOptionSelected}
        disabled={readonly}
        readOnly={readonly}
        options={options}
        getOptionLabel={getOptionLabel}
        renderInput={renderInput}
        {...customAutocompleteProps}
      ></Autocomplete>
    </FormControl>
  );
};
