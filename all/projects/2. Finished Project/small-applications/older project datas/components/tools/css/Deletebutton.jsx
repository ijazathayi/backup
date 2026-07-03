import React from 'react';
import styled from 'styled-components';

const Deletebutton = () => {
  return (
    <StyledWrapper>
      <button className="delete-button" />
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .delete-button {
    cursor: pointer;
    padding: 12px 20px;
    background-color: rgb(255, 99, 99);
    border: 2px solid rgb(0, 0, 0);
    color: White;
    font-size: 20px;
    text-align: center;
    text-transform: uppercase;
    transition: all ease 0.3s;
    border-radius: 7px;
    /* box-shadow: rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset; */
    box-shadow:
      rgba(0, 0, 0, 0.4) 0px 2px 4px,
      rgba(0, 0, 0, 0.3) 0px 7px 13px -3px,
      rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
  }

  .delete-button:hover {
    border-radius: 3px;
    background-color: rgb(255, 68, 68);
  }
  .delete-button::before {
    content: "Delete";
  }
  .delete-button:active {
    content: "Deleted";
    background-color: rgb(255, 38, 38);
    box-shadow:
      rgba(9, 30, 66, 0.25) 0px 1px 1px,
      rgba(9, 30, 66, 0.13) 0px 0px 1px 1px;
  }`;

export default Deletebutton;
