import React from 'react';
import { Title } from '../Title/Title';
import * as H from './Headline.styles';
import { Icons } from '../Icons/Icons';

export interface HeadlineProps {
  title: string;
  text?: React.ReactNode;
  icon?: 'WALLET' | 'ETHEREUM';
}

export const Headline: React.FC<HeadlineProps> = (props) => {
  return (
    <H.Headline>
      {props.icon && (
        <H.HeadlineIcon>
          <Icons name={props.icon} colored={true} />
        </H.HeadlineIcon>
      )}
      <H.HeadlineText>
        <Title>{props.title}</Title>
        {props.text && <H.HeadlineSideInfo>{props.text}</H.HeadlineSideInfo>}
      </H.HeadlineText>
    </H.Headline>
  );
};
