import React from 'react';
import { mount, shallow } from 'enzyme';
import Button from '.';

const baseProps = {
  size: 'base',
  isDisabled: false,
  label: 'OK'
}

describe('<Button />', () => {
  it('renders without error', () => {
    const wrapper = mount(
      <Button {...baseProps} />
    );

    expect(wrapper).toExist();
  });

  it('not re-render test', () => {
    const onClick = () => alert('Button clicked');

    const wrapper = shallow(<Button {...baseProps} onClick={onClick} />).instance();

    const shouldUpdate = wrapper.shouldComponentUpdate(wrapper.props);

    expect(shouldUpdate).toBe(false);
  });

  it('re-render test by value', () => {
    const onClick = () => alert('Button clicked');

    const wrapper = shallow(<Button {...baseProps} onClick={onClick} />).instance();

    const shouldUpdate = wrapper.shouldComponentUpdate({
      ...wrapper.props,
      label: "Cancel"
    });

    expect(shouldUpdate).toBe(true);
  });

  it('accepts id', () => {
    const wrapper = mount(
      <Button {...baseProps} id="testId" />
    );

    expect(wrapper.prop('id')).toEqual('testId');
  });

  it('accepts className', () => {
    const wrapper = mount(
      <Button {...baseProps} className="test" />
    );

    expect(wrapper.prop('className')).toEqual('test');
  });

  it('accepts style', () => {
    const wrapper = mount(
      <Button {...baseProps} style={{ color: 'red' }} />
    );

    expect(wrapper.getDOMNode().style).toHaveProperty('color', 'red');
  });

  it('render with isHovered prop', () => {
    const wrapper = mount(
      <Button {...baseProps} isHovered />
    );

    expect(wrapper.prop('isHovered')).toEqual(true);
  });

  it('render with isClicked prop', () => {
    const wrapper = mount(
      <Button {...baseProps} isClicked />
    );

    expect(wrapper.prop('isClicked')).toEqual(true);
  });

  it('render with isDisabled prop', () => {
    const wrapper = mount(
      <Button {...baseProps} isDisabled />
    );

    expect(wrapper.prop('isDisabled')).toEqual(true);
  });

  it('render with isLoading prop', () => {
    const wrapper = mount(
      <Button {...baseProps} isLoading />
    );

    expect(wrapper.prop('isLoading')).toEqual(true);

    wrapper.setProps({primary: true});
    expect(wrapper.prop('primary')).toEqual(true);
    expect(wrapper.prop('isLoading')).toEqual(true);
  });

  it('render with various size', () => {
    const wrapper = mount(
      <Button {...baseProps} />
    );

    wrapper.setProps({size: 'medium'});
    expect(wrapper.prop('size')).toEqual('medium');

    wrapper.setProps({size: 'big'});
    expect(wrapper.prop('size')).toEqual('big');

    wrapper.setProps({size: 'medium', primary: true});
    expect(wrapper.prop('size')).toEqual('medium');
    expect(wrapper.prop('primary')).toEqual(true);

    wrapper.setProps({size: 'big', primary: true});
    expect(wrapper.prop('size')).toEqual('big');
    expect(wrapper.prop('primary')).toEqual(true);

    wrapper.setProps({scale: true});
    expect(wrapper.prop('scale')).toEqual(true);
  });

  it('render with icon', () => {
    const icon = (<>1</>);
    const wrapper = mount(
      <Button {...baseProps} icon={icon} />
    );

    expect(wrapper.prop('icon')).toEqual(icon);

    wrapper.setProps({size: 'big', primary: true});
    expect(wrapper.prop('size')).toEqual('big');
    expect(wrapper.prop('primary')).toEqual(true);

    wrapper.setProps({size: 'medium', primary: true});
    expect(wrapper.prop('size')).toEqual('medium');
    expect(wrapper.prop('primary')).toEqual(true);
  });
});
