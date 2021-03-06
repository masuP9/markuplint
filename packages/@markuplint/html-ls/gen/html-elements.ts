import { Attribute, ContentModel, ElementSpec } from '@markuplint/ml-spec';
import fetch from './fetch';
import { getAttribute } from './get-attribute';
import { getPermittedStructures } from './get-permitted-structures';
import { nameCompare } from './utils';

export async function getHTMLElements() {
	const links = await getHTMLElementLinks();
	const specs = await Promise.all(links.map(getHTMLElement));
	// h1-h6
	const headingElementSpec = specs.find(spec => spec.name === 'h1-h6');
	if (headingElementSpec) {
		for (let i = 1; i < 6; i++) {
			const h = { ...headingElementSpec };
			const name = `h${i}`;
			h.name = name;
			h.permittedStructures = { ...h.permittedStructures, ...getPermittedStructures(name) };
			specs.push(h);
		}
	}
	return specs.sort(nameCompare);
}

export async function getHTMLElement(link: string) {
	const $ = await fetch(link);
	let name = link.replace(/.+\/([a-z0-9_-]+)$/i, '$1').toLowerCase();
	if (name === 'heading_elements') {
		name = 'h1-h6';
	}
	const $article = $('#wikiArticle');
	const description = $article
		.find('.seoSummary')
		.closest('p')
		.text()
		.trim()
		.replace(/(?:\r?\n|\s)+/gi, ' ');

	const experimental = !!$article.find('.blockIndicator.experimental').length || undefined;
	const obsolete = !!$article.find('.obsoleteHeader').length || undefined;
	const deprecated = !!$article.find('.deprecatedHeader').length || undefined;
	const nonStandard = !!$article.find('.nonStandardHeader').length || undefined;

	const categories: ContentModel[] = [];
	const cat = getProperty($, 'Content categories');
	if (/transparent/i.test(cat)) categories.push('#transparent');
	if (/metadata content/i.test(cat)) categories.push('#metadata');
	if (/flow content/i.test(cat)) categories.push('#flow');
	if (/sectioning content/i.test(cat)) categories.push('#sectioning');
	if (/heading content/i.test(cat)) categories.push('#heading');
	if (/phrasing content/i.test(cat)) categories.push('#phrasing');
	if (/embedded content/i.test(cat)) categories.push('#embedded');
	if (/interactive content/i.test(cat)) categories.push('#interactive');
	if (/palpable content/i.test(cat)) categories.push('#palpable');
	if (/script-supporting/i.test(cat)) categories.push('#script-supporting');

	const permittedContent = getProperty($, 'Permitted content');
	const permittedRoles = getProperty($, 'Permitted ARIA roles');

	const attrs = getAttributes($, '#Attributes', name);
	attrs.sort(nameCompare);

	const spec: ElementSpec = {
		name,
		cite: link,
		description,
		experimental,
		obsolete,
		deprecated,
		nonStandard,
		categories,
		permittedStructures: {
			summary: permittedContent,
			...getPermittedStructures(name),
		},
		permittedRoles: {
			summary: permittedRoles,
			roles: {},
		},
		omittion: false,
		attributes: ['#globalAttrs', '#ariaAttrs', ...attrs],
	};

	return spec;
}

function getAttributes($: CheerioStatic, heading: string, tagName: string): Attribute[] {
	const $heading = $(heading);
	const $outline = getThisOutline($heading);
	const { attributes } = getAttribute(tagName);
	return $outline
		.find('>dt')
		.toArray()
		.map((dt): Attribute | null => {
			const $dt = $(dt);
			const name = $dt.find('code').text().trim();
			if (!name) {
				return null;
			}
			const experimental = !!$dt.find('.icon-beaker').length || undefined;
			const obsolete = !!$dt.find('.icon-trash').length || !!$dt.find('.obsolete').length || undefined;
			const deprecated =
				!!$dt.find('.icon-thumbs-down-alt').length || !!$dt.find('.deprecated').length || undefined;
			const nonStandard = !!$dt.find('.icon-warning-sign').length || undefined;
			const description = $dt
				.nextAll('dd')
				.toArray()
				.map(el => $(el).text())
				.join('')
				.trim()
				.replace(/(?:\r?\n|\s)+/gi, ' ');
			const spec = attributes.find(attr => attr.name === name) || { name: tagName, type: 'string' };
			return {
				...spec,
				name,
				experimental,
				description,
				obsolete,
				deprecated,
				nonStandard,
			};
		})
		.filter((attr): attr is Attribute => !!attr);
}

function getProperty($: CheerioStatic, prop: string) {
	const $tr = $('#wikiArticle table.properties tr') || $('#Technical_summary').next('table tr');
	const $th = $(
		$tr
			.find('th')
			.toArray()
			.filter(el => new RegExp(prop, 'i').test($(el).text())),
	);
	return $th
		.siblings('td')
		.text()
		.trim()
		.replace(/(?:\r?\n|\s)+/gi, ' ');
}

function getThisOutline($start: Cheerio) {
	let $next = $start.next();
	let $els = $start.clone();
	while (!!$next.length && !$next.filter('h2').length) {
		$els = $els.add($next.clone());
		$next = $next.next();
	}
	return $els;
}

async function getHTMLElementLinks() {
	const $ = await fetch('https://developer.mozilla.org/en-US/docs/Web/HTML/Element');
	const $listHeading = $(
		$('.sidebar .quick-links details summary')
			.toArray()
			.filter(el => /html elements/i.test($(el).text()))[0],
	);
	const $list = $listHeading.siblings('ol,ul');
	const lists = $list
		.find('li a')
		.toArray()
		.map(el => `https://developer.mozilla.org${$(el).attr('href')}`);

	return lists;
}
