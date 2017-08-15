import {
	getFieldConfig, getFieldRawConfig, getWidgetForFieldOp, getOperatorsForField, 
	getOperatorConfig, getFieldWidgetConfig, getFieldPath, getFieldPathLabels
} from './configUtils';
import {defaultValue} from "../utils/stuff";
import {defaultRuleProperties, defaultGroupProperties, defaultOperator, defaultOperatorOptions, defaultRoot} from '../utils/defaultUtils';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import pickBy from 'lodash/pickBy';
import mapValues from 'lodash/mapValues';
import Immutable from 'immutable';
import {_getNewValueForFieldOp} from "../stores/tree";


export const validateTree = (tree, oldTree, config, oldConfig, removeEmptyGroups = false, removeInvalidRules = false, removeInvalidValues = false) => {
    let treeSanitized = false;

	let _validateItem = (item, path = []) => {
	    const type = item.get('type');
	    const id = item.get('id');
	    let properties = item.get('properties');
	    let children = item.get('children1');
	    let oldChildren = children;

	    if (type === 'group' && children && children.size) {
	        let conjunction = properties.get('conjunction');
	        let conjunctionDefinition = config.conjunctions[conjunction];

	        //validate children
	        let sanitized = false;
	        children = children
	            .map((currentChild) => _validateItem(currentChild, path.concat(id)));
	        if (removeEmptyGroups)
	        	children = children.filter((currentChild) => (currentChild != undefined));
	        if (oldChildren.size != children.size)
	        	sanitized = treeSanitized = true;
	        if (!children.size) {
	        	if (removeEmptyGroups && path.length) {
	        		sanitized = treeSanitized = true;
	        		return undefined;
	        	}
	        }
	        if (treeSanitized)
	        	item = item.set('children1', children);
	        return item;
	    } else if (type === 'rule') {
	        let field = properties.get('field');
	        let operator = properties.get('operator');
	        let operatorOptions = properties.get('operatorOptions');
	        let valueSrc = properties.get('valueSrc');
	        let value = properties.get('value');
	        let oldSerialized = {
	        	field,
	        	operator,
	        	operatorOptions: operatorOptions ? operatorOptions.toJS() : {},
	        	valueSrc: valueSrc ? valueSrc.toJS() : null,
	        	value: value ? value.toJS() : null,
	        };
	    	let wasValid = field && operator && value && !value.find((v, ind) => (v === undefined));

	    	//validate field
	        const fieldDefinition = field ? getFieldConfig(field, config) : null;
	        if (!fieldDefinition)
	        	field = null;
	        if (field == null) {
	        	properties = ['operator', 'operatorOptions', 'valueSrc', 'value'].reduce((map, key) => map.delete(key), properties);
	    		operator = null;
	        }
	        const typeConfig = fieldDefinition ? config.types[fieldDefinition.type] : null;

	    	//validate operator
	        operator = properties.get('operator');
	        const operatorDefinition = operator ? getOperatorConfig(config, operator, field) : null;
	        if (!operatorDefinition)
	        	operator = null;
	        const availOps = field ? getOperatorsForField(config, field) : [];
	        if (availOps.indexOf(operator) == -1)
	        	operator = null;
	        if (operator == null) {
	        	properties = properties.delete('operatorOptions');
	        	properties = properties.delete('valueSrc');
	        	properties = properties.delete('value');
	        }

	  		//validate operator options
	        operatorOptions = properties.get('operatorOptions');
	    	let operatorCardinality = operator ? defaultValue(operatorDefinition.cardinality, 1) : null;
	        if (!operator || operatorOptions && !operatorDefinition.options) {
	        	operatorOptions = null;
	        	properties = properties.delete('operatorOptions');
	        } else if (operator && !operatorOptions && operatorDefinition.options) {
	        	operatorOptions = defaultOperatorOptions(config, operator, field)
	       		properties = properties.set('operatorOptions', operatorOptions);
	        }

	        //validate values
	        valueSrc = properties.get('valueSrc');
	        value = properties.get('value');
	        let {canReuseValue, newValue, newValueSrc, newValueType} = 
                _getNewValueForFieldOp(config, oldConfig, properties, field, operator, null, removeInvalidValues);
	        value = newValue;
	        valueSrc = newValueSrc;
	        properties = properties.set('value', value);
	        properties = properties.set('valueSrc', valueSrc);

	        let newSerialized = {
	        	field,
	        	operator,
	        	operatorOptions: operatorOptions ? operatorOptions.toJS() : {},
	        	valueSrc: valueSrc ? valueSrc.toJS() : null,
	        	value: value ? value.toJS() : null,
	        };
	        let sanitized = JSON.stringify(oldSerialized) != JSON.stringify(newSerialized);
	        if (sanitized)
	        	treeSanitized = true;
	        let isValid = field && operator && value && !value.find((v, ind) => (v === undefined));

	        if (sanitized && !isValid && removeInvalidRules)
	        	return undefined;

	        if (sanitized)
	        	item = item.set('properties', properties);
	        return item;
	    }
	};

	let validatedTree = _validateItem(tree, []);
	return validatedTree;

};
