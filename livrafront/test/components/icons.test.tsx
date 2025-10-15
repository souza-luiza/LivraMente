import React from 'react'
import fs from 'fs'
import path from 'path'
import { render } from '@testing-library/react'

const ICONS_DIR = path.join(__dirname, '../../src/components/icons')

const iconFiles = fs.readdirSync(ICONS_DIR).filter((file) => file.endsWith('.tsx'))

describe('Icon components', () => {
  it('renders all icons without crashing', async () => {
    for (const file of iconFiles) {
      const filePath = path.join(ICONS_DIR, file)
      const { default: Icon } = await import(filePath)
      expect(() => render(<Icon />)).not.toThrow()
    }
  })

  it('applies className prop correctly', async () => {
    for (const file of iconFiles) {
      const filePath = path.join(ICONS_DIR, file)
      const { default: Icon } = await import(filePath)
      const { container } = render(<Icon className="test-class" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('test-class')
    }
  })
})