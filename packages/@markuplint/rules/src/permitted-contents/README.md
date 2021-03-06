---
title: permitted-contents
---

# Permitted contents (`permitted-contents`)

Warn if a child element has an allowed element or text node.

This rule refer [HTML Living Standard](https://html.spec.whatwg.org/) based [MDN Web docs](https://developer.mozilla.org/en/docs/Web/HTML). It has settings in [`@markuplint/html-ls`](https://github.com/markuplint/markuplint/blob/next/packages/%40markuplint/html-ls/index.json).

It is possible to make the structure robust by setting element relationships on template engines such as custom elements and Vue.

## Rule Details

👎 Examples of **incorrect** code for this rule

<!-- prettier-ignore-start -->
```html
<ul>
	<div>Not allowed DIV element</div>
</ul>
<ul>Not allowed text node</ul>

<table>
	<thead><tr><th>Header cell<th></tr></thead>
	<tfoot><tr><td>Wrong ordered TFOOT element<td></tr></tfoot>
	<tbody><tr><td>Body cell<td></tr></tbody>
</table>
```
<!-- prettier-ignore-end -->

👍 Examples of **correct** code for this rule

<!-- prettier-ignore-start -->
```html
<ul>
	<li>List item</li>
	<li>List item</li>
</ul>

<table>
	<thead><tr><th>Header cell<th></tr></thead>
	<tbody><tr><td>Body cell<td></tr></tbody>
	<tfoot><tr><td>Footer cell<td></tr></tfoot>
</table>
```
<!-- prettier-ignore-end -->

### Setting value

-   Type: `boolean`
-   Optional
-   Default value: `true`

### Options

Specify the target element for which you want to set a rule as an array. In the following example, rules are specified for each of the custom elements `x-container` and `x-item`.

```json:title=.markuplintrc
{
	"rules": {
		"permitted-contents": {
			"option": [
				{
					"tag": "x-container",
					"contents": []
				},
				{
					"tag": "x-item",
					"contents": []
				}
			]
		}
	}
}
```

#### `tag`

-   Type: `string`
-   Required

Specify the target element (tag) name. Case is not significant.

#### `contents`

Specify the target elements as an array. The order of this array means **allowed content order**. (Content not included in this array will be **not allowed content**)

It is defined using one of the six keywords `require`, `optional`, `oneOrMore`, `zeroOrMore`, `choice` and `interleave`.

Of these, `require`, `optional`, `oneOrMore` and `zeroOrMore` mean the number of elements. Specify the tag name (or `# text` for text nodes) using the keyword as a key. Each keyword cannot be simultaneously specified.

```json:title=.markuplintrc
{
	"rules": {
		"permitted-contents": {
			"option": [
				{
					"tag": "x-container",
					"contents": [
						{ "require": "x-item" },
						{ "optional": "y-item" },
						{ "oneOrMore": "z-item" },
						{ "zeroOrMore": "#text" },
						// ❌ キーワードの同時の指定はできない
						{
							"require": "x-item",
							"optional": "y-item"
						}
					]
				}
			]
		}
	}
}
```

| Keyword      | Number of node |
| ------------ | -------------- |
| `require`    | Always one     |
| `optional`   | Zero or one    |
| `oneOrMore`  | One or more    |
| `zeroOrMore` | Zero or more   |

An arbitrary upper-limit can be specified with the `max` key. You can also set a lower-limit `min` key when you specify `require`.

Depending on the combination, the following two specifications have the same meaning:

```json
{ "optional": "tag", "max": 5 }
{ "zeroOrMore": "tag", "max": 5 }
```

---

The two keywords `choice` and`interleave` have the following meanings for the specified array:

| Keyword      | Meanings             |
| ------------ | -------------------- |
| `choice`     | Any one              |
| `interleave` | Not matter the order |

```json:title=.markuplintrc
{
	"rules": {
		"permitted-contents": {
			"option": [
				{
					"tag": "x-container",
					"contents": [
						{
							"choice": [{ "oneOrMore": "x-item" }, { "oneOrMore": "y-item" }]
						},
						{
							"interleave": [{ "oneOrMore": "z-item" }, { "oneOrMore": "#text" }]
						}
					]
				}
			]
		}
	}
}
```

### Default notification severity

`error`
