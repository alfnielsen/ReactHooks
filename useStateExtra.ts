import produce, { Draft } from "immer"
import { useCallback, useEffect, useState } from "react"

type ReturnType<T> = [
   T,
   (value: T) => void,
   (recipe: (draft: Draft<T>) => void) => void
]

const useStateExtra = <T>(
   value: T,
   updateOnChange = false,
   updateCondition?: (value: T) => boolean,
   bindExternalSetter?: (value: T) => boolean
): ReturnType<T> => {
   // internal
   const [internalValue, internalSetter] = useState(value)
   // enable bind of setter to external
   const combinedSetter = useCallback((newValue: T) => {
      internalSetter(newValue)
      bindExternalSetter && bindExternalSetter(newValue)
   }, [bindExternalSetter, internalSetter])
   // add immer produce setter
   const immerSetter = useCallback((recipe: (draft: Draft<T>) => void) => {
      const newValue = produce(internalValue, recipe)
      combinedSetter(newValue)
   }, [internalValue, combinedSetter])
   // add update value check
   useEffect(() => {
      if (updateOnChange && (!updateCondition || updateCondition(value))) {
         internalSetter(value)
      }
   }, [updateCondition, updateOnChange, value])

   return [internalValue, combinedSetter, immerSetter]
}

export default useStateExtra
