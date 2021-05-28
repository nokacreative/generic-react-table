import { renderHook } from '@testing-library/react-hooks'
import { render, fireEvent } from '@testing-library/react'
import { useClickOutside } from './clickOutside.hook'

const onClickOutside = jest.fn()

type TesterCompProps = {
  isActive?: boolean
  manualAvoidClasses?: string[]
}

const TesterComp = ({ isActive, manualAvoidClasses }: TesterCompProps) => {
  const ref = useClickOutside(
    isActive === undefined ? true : isActive,
    onClickOutside,
    manualAvoidClasses
  )
  return (
    <div data-testid="outside">
      <div data-testid="also-outside" className="avoid">
        dhgsfg
      </div>
      <div data-testid="inside" ref={ref}>
        asdf
      </div>
    </div>
  )
}

describe('Utils - clickOutside hook', () => {
  it('calls onClickOutside() when the Escape key is pressed', () => {
    renderHook(() => useClickOutside(true, onClickOutside))
    fireEvent(document.body, new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(onClickOutside).toHaveBeenCalled()
  })

  it('calls onClickOutside() when the document is clicked', () => {
    const testerComp = render(<TesterComp />)
    const outsideDiv = testerComp.getByTestId('outside')
    fireEvent(outsideDiv, new MouseEvent('click'))
    expect(onClickOutside).toHaveBeenCalled()
  })

  it('does not call onClickOutside() when the element with the ref is clicked', () => {
    const testerComp = render(<TesterComp />)
    const insideDiv = testerComp.getByTestId('inside')
    fireEvent(insideDiv, new MouseEvent('click'))
    expect(onClickOutside).not.toHaveBeenCalled()
  })

  it('does not call onClickOutside() when the clicked element contains classes in manualAvoidClasses', () => {
    const testerComp = render(<TesterComp manualAvoidClasses={['avoid']} />)
    const avoidDiv = testerComp.getByTestId('also-outside')
    fireEvent(avoidDiv, new MouseEvent('click'))
    expect(onClickOutside).not.toHaveBeenCalled()
  })

  it('does not call onClickOutside() when isActive is false', () => {
    const testerComp = render(<TesterComp isActive={false} />)
    const outsideDiv = testerComp.getByTestId('outside')
    fireEvent(outsideDiv, new MouseEvent('click'))
    expect(onClickOutside).not.toHaveBeenCalled()
  })
})
