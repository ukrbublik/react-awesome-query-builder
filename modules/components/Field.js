import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {getFieldConfig, getFieldPath, getFieldPathLabels} from "../utils/configUtils";
import {truncateString} from "../utils/stuff";
import last from 'lodash/last';
import keys from 'lodash/keys';
import pick from 'lodash/pick';


export default class Field extends PureComponent {
    static propTypes = {
        config: PropTypes.object.isRequired,
        selectedField: PropTypes.string,
        customProps: PropTypes.object,
        //actions
        setField: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.componentWillReceiveProps(props);
    }

    componentWillReceiveProps(nextProps) {
        const prevProps = this.props;
        const keysForMeta = ["selectedField", "config"];
        const needUpdateMeta = !this.meta || keysForMeta.map(k => (nextProps[k] !== prevProps[k])).filter(ch => ch).length > 0;

        if (needUpdateMeta) {
            this.meta = this.getMeta(nextProps);
        }
    }

    getMeta({selectedField, config}) {
        const selectedKey = selectedField;
        const {maxLabelsLength, fieldSeparatorDisplay, fieldPlaceholder} = config.settings;
        const placeholder = !isFieldSelected ? truncateString(fieldPlaceholder, maxLabelsLength) : null;
        const isFieldSelected = !!selectedField;
        const currField = isFieldSelected ? getFieldConfig(selectedKey, config) : null;
        const selectedOpts = currField || {};

        const selectedKeys = getFieldPath(selectedKey, config);
        const selectedPath = getFieldPath(selectedKey, config, true);
        const selectedLabel = this.getFieldLabel(currField, selectedKey, config);
        const partsLabels = getFieldPathLabels(selectedKey, config);
        let selectedFullLabel = partsLabels ? partsLabels.join(fieldSeparatorDisplay) : null;
        if (selectedFullLabel == selectedLabel)
            selectedFullLabel = null;
        const selectedAltLabel = selectedOpts.label2;

        const items = this.buildOptions(config, config.fields);

        return {
            placeholder, items,
            selectedKey, selectedKeys, selectedPath, selectedLabel, selectedOpts, selectedAltLabel, selectedFullLabel,
        };
    }

    getFieldLabel(fieldOpts, fieldKey, config) {
        if (!fieldKey) return null;
        let fieldSeparator = config.settings.fieldSeparator;
        let maxLabelsLength = config.settings.maxLabelsLength;
        let fieldParts = Array.isArray(fieldKey) ? fieldKey : fieldKey.split(fieldSeparator);
        let label = fieldOpts.label || last(fieldParts);
        label = truncateString(label, maxLabelsLength);
        return label;
    }

    buildOptions(config, fields, path = null, optGroupLabel = null) {
        if (!fields)
            return null;
        const {fieldSeparator, fieldSeparatorDisplay} = config.settings;
        const prefix = path ? path.join(fieldSeparator) + fieldSeparator : '';

        return keys(fields).map(fieldKey => {
            const field = fields[fieldKey];
            const label = this.getFieldLabel(field, fieldKey, config);
            const partsLabels = getFieldPathLabels(fieldKey, config);
            let fullLabel = partsLabels.join(fieldSeparatorDisplay);
            if (fullLabel == label)
                fullLabel = null;
            const altLabel = field.label2;
            const tooltip = field.tooltip;
            const subpath = (path ? path : []).concat(fieldKey);

            if (field.type == "!struct") {
                return {
                    key: fieldKey,
                    path: prefix+fieldKey,
                    label,
                    fullLabel,
                    altLabel,
                    tooltip,
                    items: this.buildOptions(config, field.subfields, subpath, label)
                };
            } else {
                return {
                    key: fieldKey,
                    path: prefix+fieldKey,
                    label,
                    fullLabel,
                    altLabel,
                    tooltip,
                    grouplabel: optGroupLabel
                };
            }
        });
    }

    render() {
        const {config, customProps, setField} = this.props;
        const {renderField} = config.settings;
        const renderProps = {
            config, 
            customProps, 
            setField,
            ...this.meta
        };
        return renderField(renderProps);
    }

}
