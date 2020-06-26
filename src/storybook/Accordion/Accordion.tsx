import * as React from 'react';
import { AccordionBarContent } from '../Bar/Bar';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';

export type AccordionSection = string;

export interface AccordionSectionProps {
  label: string;
  value: string;
  activeSections: string[];
  sectionSelector: (section: string) => void;
}

export function AccordionSection(props: AccordionSectionProps) {
  return (
    <AccordionBarContent
      active={props.activeSections.includes(props.value)}
      onClick={() => props.sectionSelector(props.value)}
    >
      {props.label}
      {props.activeSections.includes(props.value) ? <FaChevronDown /> : <FaChevronRight />}
    </AccordionBarContent>
  );
}
