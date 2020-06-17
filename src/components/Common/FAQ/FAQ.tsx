import { ReactHTML } from 'react';

import React from 'react';

export const FAQTOC: React.FC = (props) => {
  return <ul>{props.children}</ul>;
};

export const FAQToCItem: React.FC = (props) => {
  return <li>{props.children}</li>;
};

export const FAQSection: React.FC = (props) => {
  return <h3>{props.children}</h3>;
};

export const FAQQuestion: React.FC = (props) => {
  return <h4>{props.children}</h4>;
};

export const FAQAnswer: React.FC = (props) => {
  return <p>{props.children}</p>;
};
