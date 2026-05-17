const fs = require('fs')
const path = require('path')

const WRONG_OPEN = '<' + 'motion'
const RIGHT_OPEN = '<' + 'motion'
const WRONG_CLOSE = '</' + 'motion' + '>'
const RIGHT_CLOSE = '</' + 'motion' + '>'

// Fix accidental JSX tag name "motion" -> "div"
const BAD_OPEN = '<motion'
const GOOD_OPEN = '<div'
const BAD_CLOSE = '</motion>'
const GOOD_CLOSE = '</div>'

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name === 'generated') continue
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) {
      if (!name.startsWith('.')) walk(p)
    } else if (name.endsWith('.tsx')) {
      let c = fs.readFileSync(p, 'utf8')
      if (!c.includes('motion')) continue
      const fixed = c.split(BAD_OPEN).join(GOOD_OPEN).split(BAD_CLOSE).join(GOOD_CLOSE)
      if (fixed !== c) {
        fs.writeFileSync(p, fixed)
        console.log('fixed:', p)
      }
    }
  }
}

walk(path.join(__dirname, '..'))
