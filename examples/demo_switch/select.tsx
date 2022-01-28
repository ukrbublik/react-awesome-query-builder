import React from "react";
import { FC, memo } from 'react'
import Creatable from 'react-select/creatable'
import { MultiValue } from 'react-select'

const options = [
  {
    id: 'foo',
    label: 'Foo',
    properties: ['REQUIRED', 'CREATE', 'UPDATE'],
    type: { format: 'INTEGER' },
  },
  {
    id: 'bar',
    label: 'Bar',
    properties: ['REQUIRED', 'CREATE', 'UPDATE'],
    type: { format: 'INTEGER' },
  },
]

interface Item {
  value: string
  type: string
}

interface Iprops {
  k: string
  value?: Item[]
  setValue(value: Item[]): void
}

const MltSelector: FC<Iprops> = ({
  k,
  value,
  setValue,
}) => {
  function initMltSelectValueHandler(list: any[], val: Item[]) {
    if (val) {
      return val.map((item) => {
        let res = item.type != "const" && list && list.find((obj) => obj.id === item.value)
        if (!res) {
          res = { id: item.value, label: item.value, value: item.value, __isNew__: true }
        }
        return res
      })
    }
    return [];
  }

  function changeHandler(values: MultiValue<any>, actionMeta: any, setValue: (value: Item[]) => void): any[] {
    const res = values.map((val) => ({
        value: val.id || val.label,
        type: val.__isNew__ ? "const" : "property"
    }))
    setValue(res)
    return res
  }

  return (
    <Creatable
      menuPortalTarget={document.body}
      key={k}
      isMulti
      options={options}
      value={initMltSelectValueHandler(options, value)}
      getOptionValue={(option: any) => option.id}
      getOptionLabel={(option: any) => option.label}
      onChange={(values, actionMeta) => {
        changeHandler(values, actionMeta, setValue)
      }}
    />
  )
}

export default memo(MltSelector)
