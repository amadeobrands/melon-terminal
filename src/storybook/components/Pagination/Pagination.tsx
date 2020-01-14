import React from 'react';
import * as S from './Pagination.styles';

export interface PaginationProps {
  hasPrevious: boolean;
  hasNext: boolean;
  previous: () => void;
  next: () => void;
  first: () => void;
  last: () => void;
  actual: number;
  totalItems: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  hasPrevious = false,
  hasNext = false,
  previous = () => {},
  next = () => {},
  first = () => {},
  last = () => {},
  actual = 0,
  totalItems = 0,
}) => (
  <S.Container>
    {!hasPrevious && <S.Button onClick={first}>|&lt;</S.Button>}
    {!hasPrevious && <S.Button onClick={previous}>&lt;</S.Button>}
    <S.Span>{`${actual + 1}-${actual + 20 > totalItems ? totalItems : actual + 20} of ${totalItems}`}</S.Span>
    {!hasNext && <S.Button onClick={next}>&gt;</S.Button>}
    {!hasNext && <S.Button onClick={last}>&gt;|</S.Button>}
  </S.Container>
);