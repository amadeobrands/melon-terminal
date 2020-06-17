import React from 'react';
import { Container } from '~/storybook/Container/Container';
import { Grid, GridRow, GridCol } from '~/storybook/Grid/Grid';
import { Block } from '~/storybook/Block/Block';

import { SectionTitle } from '~/storybook/Title/Title';
import { FAQSection, FAQQuestion, FAQAnswer, FAQTOC, FAQToCItem } from '~/components/Common/FAQ/FAQ';

export const FAQ: React.FC = () => {
  return (
    <Container>
      <Grid>
        <GridRow>
          <GridCol xs={12} sm={12}>
            <Block>
              <SectionTitle>FAQ</SectionTitle>

              <FAQTOC>
                <FAQToCItem>Fund Setup</FAQToCItem>
                <FAQToCItem>Fund Policies</FAQToCItem>
                <FAQToCItem>Fund Setup</FAQToCItem>
              </FAQTOC>

              <FAQSection>Fund Setup</FAQSection>

              <FAQQuestion>How much does it cost to setup a Melon fund?</FAQQuestion>

              <FAQAnswer>The costs of setting up a Melon fund can vary greatly.</FAQAnswer>
            </Block>
          </GridCol>
        </GridRow>
      </Grid>
    </Container>
  );
};

export default FAQ;
