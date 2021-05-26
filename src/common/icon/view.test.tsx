import { shallow } from 'enzyme'
import React from 'react'

import { Icons } from './data'
import { Icon } from './view'

describe('Icon', () => {
  it('adds the "clickable" className when onClick is provided, and passes down the onClick function', () => {
    const onClick = jest.fn()
    const component = shallow(<Icon icon={Icons.Filter} onClick={onClick} />)
    expect(component.prop('className')).toEqual('icon clickable')
    expect(component.prop('onClick')).toBe(onClick)
  })

  it('sets aria-hidden to false when onClick is given', () => {
    const component = shallow(<Icon icon={Icons.Filter} onClick={jest.fn()} />)
    expect(component.prop('aria-hidden')).toBeFalsy()
  })

  it('sets aria-hidden to true when onClick is NOT given', () => {
    const component = shallow(<Icon icon={Icons.Filter} />)
    expect(component.prop('aria-hidden')).toBeTruthy()
  })

  it('sets the title prop as the given tooltip', () => {
    const tooltip = 'asdf'
    const component = shallow(<Icon icon={Icons.Filter} tooltip={tooltip} />)
    expect(component.prop('title')).toBe(tooltip)
  })

  it('sets any given id', () => {
    const id = 'gsfd'
    const component = shallow(<Icon icon={Icons.Filter} id={id} />)
    expect(component.prop('id')).toBe(id)
  })
})
