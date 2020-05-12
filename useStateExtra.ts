import produce, { Draft } from "immer"
import { useCallback, useEffect, useState } from "react"

type DraftMethod<T> = (draft: Draft<T>) => void

type ReturnType<T> = [
   T,
   (value: T) => void,
   (recipe: (draft: Draft<T>) => void) => void
]

interface IUseStateExtraOptions<T> {
   /** Update state when incoming value is changed. Can be set to `true` or an update method (immer produce method) */
   autoUpdate?: (boolean | ((draft: Draft<T>) => void)),
   /** Bind another onChange method. Used to push state to external onChange method. */
   bindUpdate?: (value: T) => void
}
/**
 * useState Extra!
 * @param value 
 * @param opt 
 */
const useStateExtra = <T>(
   value: T,
   opt?: IUseStateExtraOptions<T>
): ReturnType<T> => {
   const { autoUpdate, bindUpdate: bind } = opt ?? {}
   let firstComingValue = value
   if (autoUpdate && autoUpdate instanceof Function) {
      firstComingValue = produce(value, autoUpdate)
   }
   const [internalValue, internalSetter] = useState(firstComingValue)
   // enable bind of setter to external
   const set = useCallback((newValue: T) => {
      internalSetter(newValue)
      bind && bind(newValue)
   }, [bind])
   // add immer produce setter
   const update = useCallback((recipe: DraftMethod<T>) => {
      const newValue = produce(internalValue, recipe)
      set(newValue)
   }, [internalValue, set])
   // add update value check
   useEffect(() => {
      if (autoUpdate) {
         let mutatedValue = value
         if (autoUpdate instanceof Function) {
            mutatedValue = produce(value, autoUpdate)
         }
         internalSetter(mutatedValue)
      }
   }, [autoUpdate, value])
   // return [value, normalSetter with optional bind, immer produce method as setter ]
   return [internalValue, set, update]
}

export default useStateExtra
