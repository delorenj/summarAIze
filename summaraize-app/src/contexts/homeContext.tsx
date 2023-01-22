import React, { useState, useEffect, useContext } from 'react'

import * as cognito from '../libs/cognito'
import {IBook} from "../hooks/useMyData";

export enum AuthStatus {
  Loading,
  SignedIn,
  SignedOut,
}

export interface IHomeContext {
  summaraizeDrawerOpen: boolean,
  setSummaraizeDrawerOpen(open: boolean): void,
  activeBook?: IBook,
  setActiveBook(book: IBook): void
}

const defaultState: IHomeContext = {
  setSummaraizeDrawerOpen(open: boolean): void {},
  summaraizeDrawerOpen: false,
  setActiveBook(book: IBook) {}
}

type Props = {
  children?: React.ReactNode
}

export const HomeContext = React.createContext(defaultState)

const HomeContextProvider = ({ children }: Props) => {
  const [summaraizeDrawerOpen, setSummaraizeDrawerOpen] = useState<boolean>(false)
  const [activeBook, setActiveBook] = useState<IBook>()

  const state: IHomeContext = {
    summaraizeDrawerOpen,
    setSummaraizeDrawerOpen,
    activeBook,
    setActiveBook
  }
  return <HomeContext.Provider value={state}>{children}</HomeContext.Provider>
}

export const useHomeContext = () => (useContext(HomeContext));

export default HomeContextProvider
