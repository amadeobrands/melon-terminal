import React from 'react';
import * as S from './FAQ.styles';

interface FFAQToCItemProps {
  section: string;
}

interface FAQSectionProps {
  name?: string;
}

export const FAQTOC: React.FC = (props) => {
  return <S.ToC>{props.children}</S.ToC>;
};

export const FAQToCItem: React.FC<FFAQToCItemProps> = (props) => {
  return (
    <S.ToCItem>
      <a href={`#${props.section}`}>{props.children}</a>
    </S.ToCItem>
  );
};

export const FAQSection: React.FC<FAQSectionProps> = (props) => {
  return <h3 id={props.name}>{props.children}</h3>;
};

export const FAQQuestion: React.FC = (props) => {
  return <h4>{props.children}</h4>;
};

export const FAQAnswer: React.FC = (props) => {
  return <p>{props.children}</p>;
};
