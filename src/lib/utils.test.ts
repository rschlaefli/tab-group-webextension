import { augmentTabExtras, normalizeStringForHashing } from './utils'

describe('utils', () => {
  it('can handle tab data containing a normal title', () => {
    const augmentedTab = augmentTabExtras({ title: 'hello world' })
    expect(augmentedTab.title).toEqual('hello world')

    expect(augmentedTab).toMatchInlineSnapshot(`
      Object {
        "normalizedTitle": "hello world",
        "title": "hello world",
      }
    `)
  })

  it('can handle tab data with a URL in its title', () => {
    const augmentedTab = augmentTabExtras({ title: 'https://github.com/hello/index?secret=mypass' })
    expect(augmentedTab.title).toEqual('https://github.com/hello/index')

    expect(augmentedTab).toMatchInlineSnapshot(`
      Object {
        "normalizedTitle": "https github com hello index",
        "title": "https://github.com/hello/index",
      }
    `)
  })

  it('can handle tab data containing a url', () => {
    const augmentedTab = augmentTabExtras({ url: 'https://github.com/rschlaefli' })

    expect(augmentedTab).toMatchInlineSnapshot(`
      Object {
        "baseUrl": "https://github.com/rschlaefli",
        "hash": "f07cdb4d914e183b894c4f266123548d",
        "origin": "https://github.com",
        "url": "https://github.com/rschlaefli",
      }
    `)
  })

  it('can handle tab data containing a url and title', () => {
    const augmentedTab = augmentTabExtras({ url: 'https://github.com/rschlaefli', title: 'Github' })

    expect(augmentedTab).toMatchInlineSnapshot(`
      Object {
        "baseUrl": "https://github.com/rschlaefli",
        "hash": "12b2e7c94f58b9cd0616bde70e6817fc",
        "normalizedTitle": "Github",
        "origin": "https://github.com",
        "title": "Github",
        "url": "https://github.com/rschlaefli",
      }
    `)
  })

  it('can handle tab data containing a url, title, and hash', () => {
    const augmentedTab = augmentTabExtras({
      url: 'https://github.com/rschlaefli',
      title: 'Github',
      hash: 'someHashThatShouldStay',
    })

    expect(augmentedTab).toMatchInlineSnapshot(`
      Object {
        "hash": "someHashThatShouldStay",
        "normalizedTitle": "Github",
        "title": "Github",
        "url": "https://github.com/rschlaefli",
      }
    `)
  })

  it('can normalize strings for hashing', () => {
    const normalizedTitle = normalizeStringForHashing(
      ' https://www.github.com #*$^ this is weird 1234   asdasd asd '
    )
    expect(normalizedTitle).toMatchInlineSnapshot(`"https www github com this is weird asdasd asd"`)

    const whatsAppTitle = normalizeStringForHashing('(2) WhatsApp')
    const whatsAppTitle2 = normalizeStringForHashing('WhatsApp')
    expect(whatsAppTitle).toEqual(whatsAppTitle2)
  })
})
