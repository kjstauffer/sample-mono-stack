import React from 'react';
import styled from '@emotion/styled';
import { Global, css } from '@emotion/react';

const BaselineStyle = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      <Global
        styles={css`
          body {
            background-color: black;
            color: white;
            margin: 0;
            padding: 0;
          }
        `}
      />
      {children}
    </>
  );
};

const StyleWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
`;

export { BaselineStyle, StyleWrapper };
