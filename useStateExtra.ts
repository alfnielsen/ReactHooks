import produce, { Draft } from "immer"
import { useCallback, useEffect, useState } from "react"

type ReturnType<T> = [
   T,
   (value: T) => void,
   (recipe: (draft: Draft<T>) => void) => void
]
interface IUseStateExtraOptions<T> {
   /** Update the internal state, when incoming value changes  */
   updateInternalOnChange?: boolean,
   /** Setup a delegate for when 'updateInternalOnChange' should update internal value */
   updateCondition?: (value: T) => boolean,
   /** Bind internal setter to and external (The external will be called when the internal is call. It will NOT be called on updateInternalOnChange ) */
   bindExternalSetter?: (value: T) => void
}
/**
 * useState Extra!
 * Adding options:
 * - Produce setter (immer produce delegate)
 * - Bind setter to external setter
 * - Auto update when incoming value changes
 * 
 * @param value 
 * @param opt 
 */
const useStateExtra = <T>(
   value: T,
   opt?: IUseStateExtraOptions<T>
): ReturnType<T> => {
   const { bindExternalSetter, updateCondition, updateInternalOnChange: updateOnChange } = opt || {}
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
   // return [value, normalSetter with optional bind, immer produce method as setter ]
   return [internalValue, combinedSetter, immerSetter]
}

export default useStateExtra
