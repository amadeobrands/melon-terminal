import styled from 'styled-components';
import { Logo as BaseLogo } from '../../Common/Logo/Logo';

export const HeaderPosition = styled.div`
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 100;
`;

export const Header = styled.div`
  border-bottom: 1px solid ${props => props.theme.mainColors.border};
  background-color: ${props => props.theme.mainColors.secondary};
  font-size: ${props => props.theme.fontSizes.s};
  line-height: 1;
  display: flex;
  flex-wrap: nowrap;

  @media (${props => props.theme.mediaQueries.m}) {
    justify-content: space-between;
  }
`;

export const Logo = styled(BaseLogo)``;

export const LogoContainer = styled.span`
  display: flex;
  align-items: center;
  padding: ${props => props.theme.spaceUnits.xs};
  border-right: 1px solid ${props => props.theme.mainColors.border};

  ${Logo} {
    display: none;

    @media (${props => props.theme.mediaQueries.s}) {
      display: inline-block;
    }
  }
`;

export const Account = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${props => props.theme.spaceUnits.xs} ${props => props.theme.spaceUnits.m};
  font-size: ${props => props.theme.fontSizes.s};
  justify-content: center;

  @media (${props => props.theme.mediaQueries.m}) {
    flex: 1 0 auto;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
  }
`;

export const AccountName = styled.div`
  font-weight: ${props => props.theme.fontWeights.bold};
  font-size: ${props => props.theme.fontSizes.m};
  margin-bottom: ${props => props.theme.spaceUnits.xxs};

  @media (${props => props.theme.mediaQueries.m}) {
    margin-bottom: 0;
  }
`;

export const AccountInfo = styled.div``;

const AccountInfoItem = styled.span`
  &::before {
    content: '|';
    margin-right: ${props => props.theme.spaceUnits.xxs};
    padding-left: ${props => props.theme.spaceUnits.xxs};
    color: ${props => props.theme.otherColors.grey};
  }
`;

export const AccountAddress = styled(AccountInfoItem)`
  &::before {
    content: '';
    margin-right: 0;
    padding-left: 0;
  }
`;

export const AccountNetwork = styled(AccountInfoItem)``;

export const AccountBalance = styled(AccountInfoItem)``;

export const AccountStatus = styled(AccountInfoItem)``;
