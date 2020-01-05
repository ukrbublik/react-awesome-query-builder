import {
	getFieldConfig, getOperatorsForField, getOperatorConfig
} from './configUtils';
import {defaultValue, deepEqual} from "../utils/stuff";
import {defaultOperatorOptions} from '../utils/defaultUtils';
import {getNewValueForFieldOp} from "../stores/tree";


export const validateTree = (tree, _oldTree, config, oldConfig, removeEmptyGroups = false, removeInvalidRules = false) => {
	const c = {
		config, oldConfig, removeEmptyGroups, removeInvalidRules
	};
	return _validateItem(tree, [], null, {}, c);
};

function _validateItem (item, path, itemId, meta, c) {
	const type = item.get('type');
	const children = item.get('children1');

	if (type === 'group' && children && children.size) {
		return _validateGroup(item, path, itemId, meta, c);
	} else if (type === 'rule') {
		return _validateRule(item, path, itemId, meta, c);
	} else {
		return item;
	}
};

function _validateGroup (item, path, itemId, meta, c) {
	const {removeEmptyGroups} = c;
	let id = item.get('id');
	let children = item.get('children1');
	const oldChildren = children;

	if (!id && itemId) {
		id = itemId;
		item = item.set('id', id);
		meta.sanitized = true;
	}

	//validate children
	let submeta = {};
	children = children
		.map( (currentChild, childId) => _validateItem(currentChild, path.concat(id), childId, submeta, c) );
	if (removeEmptyGroups)
		children = children.filter((currentChild) => (currentChild != undefined));
	let sanitized = submeta.sanitized || (oldChildren.size != children.size);
	if (!children.size && removeEmptyGroups && path.length) {
		sanitized = true;
		item = undefined;
	}
	
	if (sanitized)
		meta.sanitized = true;
	if (sanitized && item)
		item = item.set('children1', children);
	return item;
};


function _validateRule (item, path, itemId, meta, c) {
	const {removeInvalidRules, config, oldConfig} = c;
	let id = item.get('id');
	let properties = item.get('properties');
	let field = properties.get('field');
	let operator = properties.get('operator');
	let operatorOptions = properties.get('operatorOptions');
	let valueSrc = properties.get('valueSrc');
	let value = properties.get('value');
	const oldSerialized = {
		field,
		operator,
		operatorOptions: operatorOptions ? operatorOptions.toJS() : {},
		valueSrc: valueSrc ? valueSrc.toJS() : null,
		value: value ? value.toJS() : null,
	};
	let _wasValid = field && operator && value && !value.find((v, ind) => (v === undefined));

	if (!id && itemId) {
		id = itemId;
		item = item.set('id', id);
		meta.sanitized = true;
	}

	//validate field
	const fieldDefinition = field ? getFieldConfig(field, config) : null;
	if (!fieldDefinition)
		field = null;
	if (field == null) {
		properties = ['operator', 'operatorOptions', 'valueSrc', 'value'].reduce((map, key) => map.delete(key), properties);
		operator = null;
	}

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
	let _operatorCardinality = operator ? defaultValue(operatorDefinition.cardinality, 1) : null;
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
	let {newValue, newValueSrc} = 
			getNewValueForFieldOp(config, oldConfig, properties, field, operator, null, true);
	value = newValue;
	valueSrc = newValueSrc;
	properties = properties.set('value', value);
	properties = properties.set('valueSrc', valueSrc);

	const newSerialized = {
		field,
		operator,
		operatorOptions: operatorOptions ? operatorOptions.toJS() : {},
		valueSrc: valueSrc ? valueSrc.toJS() : null,
		value: value ? value.toJS() : null,
	};
	const sanitized = !deepEqual(oldSerialized, newSerialized);
	const isValid = field && operator && value && !value.find((v, _ind) => (v === undefined));
	if (sanitized)
		meta.sanitized = true;

	if (sanitized && !isValid && removeInvalidRules)
		item = undefined;
	if (sanitized && item)
		item = item.set('properties', properties);
	
	return item;
};
