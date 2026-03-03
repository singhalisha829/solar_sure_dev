import { chevronDown, filter } from '@/utils/images'
import Image from 'next/image'
import { useState } from 'react'
import Button from './Button'

function Dropdown({ options, selectedOption, onOptionSelect }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleOptionSelect = (option) => {
    setIsOpen(false)
    onOptionSelect(option)
  }

  return (
    <div className='relative col-start-1 col-end-4 p-1 rounded-md h-[40px] flex items-center border-1 border-ornategrey'>
      <button
        className='w-full ml-8 text-left text-lightgrey'
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption}
      </button>
      <Image
        className='absolute left-2 top-1/2 translate-y-[-50%] cursor-pointer'
        src={filter}
        alt='chevron down'
        onClick={() => setIsOpen(!isOpen)}
      />
      <Image
        className='absolute right-2 top-1/2 translate-y-[-50%] cursor-pointer'
        src={chevronDown}
        alt='chevron down'
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <div className='absolute top-[35px] left-0 w-full mt-1 bg-neutral-50'>
          {options.map(
            (option) => (
              // option !== selectedOption ? (
              <button
                className='block w-full p-1 ml-8 leading-4 text-left hover:font-bold'
                key={option}
                onClick={() => handleOptionSelect(option)}
              >
                {option}
              </button>
            )
            // ) : null
          )}
        </div>
      )}
    </div>
  )
}

export default Dropdown
