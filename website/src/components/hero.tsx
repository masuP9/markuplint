import React from 'react';
import styled from 'styled-components';
import { StaticQuery, graphql } from 'gatsby';

const Style = styled.div`
	position: relative;
	top: 0;
	left: 50%;
	transform: translate(-50%, 0);
	color: var(--lightest-color);
	padding: 4em 2em;
	text-align: center;
	overflow: hidden;

	background-color: var(--primary-color);
	background-image: linear-gradient(
			to right bottom,
			transparent 0,
			transparent 50%,
			var(--primary-color) 50.1%,
			var(--primary-color) 100%
		),
		linear-gradient(to right, var(--primary-color), var(--primary-color-dark));
	background-position: center top;
	background-repeat: no-repeat;
	background-size: 100% 100%;

	h1 {
		position: relative;
		font-size: 3rem;
		font-weight: 400;
		margin-top: 0;
	}

	p {
		position: relative;
		font-size: 2rem;
		opacity: 0.8;
		margin-bottom: 0;
	}
`;

interface Props {
	site: {
		siteMetadata: {
			name: string;
			description: string;
		};
	};
}

const Hero: React.FunctionComponent = () => {
	return (
		<StaticQuery
			query={graphql`
				query {
					site {
						siteMetadata {
							name
							description
						}
					}
				}
			`}
			render={(props: Props) => (
				<Style>
					<h1>For all markupers</h1>
				</Style>
			)}
		/>
	);
};

export default Hero;
