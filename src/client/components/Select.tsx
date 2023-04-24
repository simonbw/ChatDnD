import { Listbox, Transition } from "@headlessui/react";
import React, { Fragment, ReactNode } from "react";

export function Select<T extends string>({
  value,
  onChange,
  label,
  options,
}: {
  value: T;
  onChange: (t: T) => void;
  label: ReactNode;
  options: { value: T }[];
}) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative w-full">
        <Listbox.Label className="block small-caps">{label}</Listbox.Label>
        <Listbox.Button className="select-button">
          {value} <span className="float-right">▾</span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          enter="transition duration-150 origin-top"
          enterFrom="scale-0 opacity-0"
          enterTo="scale-100 opacity-100"
          leave="transition duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="select-options">
            {options.map((option) => (
              <Listbox.Option
                className="select-option"
                key={option.value}
                value={option.value}
              >
                {option.value}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
