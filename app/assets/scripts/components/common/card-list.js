import React from 'react';
import styled from 'styled-components';
import ShadowScrollbar from '../common/shadow-scrollbar';
import T from 'prop-types';

import { truncated } from '../../styles/helpers/index';
import { themeVal } from '../../styles/utils/general';

const CardWrapper = styled.article`
  height: ${({ size }) => (size === 'large' ? '5rem' : '3.5rem')};
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  border: 1px solid ${themeVal('color.baseAlphaC')};

  box-shadow: 0 0 16px 2px ${themeVal('color.baseAlphaA')},
    0 8px 24px -16px ${themeVal('color.baseAlphaB')};

  cursor: pointer;
  transition: all .16s ease 0s;
  &:hover {
    box-shadow: 0 0 16px 4px ${themeVal('color.baseAlphaA')},
      0 8px 24px -8px ${themeVal('color.baseAlphaB')};
    transform: translate(0, -0.125rem);
  }
`;

const CardMedia = styled.figure`
  display: flex;
  margin: 0.5rem;
  margin-right: 0;
  position: relative;
  &:before {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 3;
    content: "";
    box-shadow: inset 0 0 0 1px ${themeVal('color.baseAlphaB')};
    pointer-events: none;
  }
`;
const CardIcon = styled.img`
  width: 3rem;
`;
const CardTitle = styled.h4`
  ${truncated}
  padding: 1rem;
`;

export const Card = ({ title, iconPath, size, onClick }) => {
  return (
    <CardWrapper size={size} onClick={onClick}>
      <CardMedia>
        <CardIcon src={iconPath} />
      </CardMedia>
      <CardTitle>{title}</CardTitle>
    </CardWrapper>
  );
};

Card.propTypes = {
  title: T.string,
  iconPath: T.string,
  size: T.oneOf(['small', 'large']),
  onClick: T.func
};

const CardListWrapper = styled(ShadowScrollbar)`
  height: 60vh;
`;
const CardListContainer = styled.ol`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 2rem;
  padding: 1rem 1rem 1rem 0;
`;

function CardList ({ data, renderCard, filterCard = () => true }) {
  return (
    <CardListWrapper>
      <CardListContainer>
        {data.filter(filterCard).map(renderCard)}
      </CardListContainer>
    </CardListWrapper>
  );
}

CardList.propTypes = {
  data: T.array,
  renderCard: T.func,
  filterCard: T.func
};

export default CardList;
