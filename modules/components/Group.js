import { default as React, PropTypes } from 'react';
import PureComponent from 'react-pure-render/component';
import collectionMap from 'lodash/collection/map';
import GroupContainer from './containers/GroupContainer';

class Group extends PureComponent {
  render () {
    return (
      <div className="group">
        <div className="group--header">
          <div className="group--conjunctions">
            {collectionMap(this.props.conjunctionOptions, (item, index) => (
              <div key={index} className={`conjunction conjunction--${index.toUpperCase()}`} data-state={item.checked ? 'active' : 'inactive'}>
                <label htmlFor={item.id}>{item.label}</label>
                <input id={item.id} type="radio"name={item.name} value={index} checked={item.checked} onChange={item.setConjunction} />
              </div>
            ))}
          </div>
          <div className="group--actions">
            {this.props.allowFurtherNesting ? (
              <button className="action action--ADD-GROUP" onClick={this.props.addGroup}>Add group</button>
            ) : null}
            <button className="action action--ADD-RULE" onClick={this.props.addRule}>Add rule</button>
            {this.props.allowRemoval ? (
              <button className="action action--DELETE" onClick={this.props.removeSelf}>Delete</button>
            ) : null}
          </div>
        </div>
        {this.props.children ? (
          <div className="group--children">{this.props.children}</div>
        ) : null}
      </div>
    );
  }
}

Group.propTypes = {
  conjunctionOptions: PropTypes.object.isRequired,
  addRule: PropTypes.func.isRequired,
  addGroup: PropTypes.func.isRequired,
  removeSelf: PropTypes.func.isRequired,
  allowFurtherNesting: PropTypes.bool.isRequired,
  allowRemoval: PropTypes.bool.isRequired
};

export default GroupContainer(Group);
