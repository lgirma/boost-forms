## Todo

- [ ] Custom field renderer
- [ ] Document each field type
- [ ] Easily manage field types
    - [ ] Make sure renderers support field types
    - [ ] Manage external dependencies (captcha, gallery, etc.)
- [ ] Provide integration with Bootstrap/Tailwind/Bulma/etc.
    - [ ] Various layouts (inline, in-table)
    - [ ] Tailwind UI
    - [ ] Support react custom components
        - [ ] For Chakra-UI, Material-UI
- [ ] Find easier way to configure form. `formConfig.fieldsConfig.age.type` is too deep
- [ ] Groups
- [ ] Visual Forms Studio (boost-web-forms-studio)
- [ ] Merge renderOptions and formConfig (useful for composite field types)
- [ ] Consider i18n for hard-coded strings like 'Misc'
- [ ] Add grouping utility (`getFieldGroupIterator`?)
  - For re-use in all layouts 
  - interface:
    - `FieldGroup { label: string, options: {variation: 'tab'|'normal'}, fields: FieldConfig[]}`
  - Add `groupOptions` in `FieldConfig`
  - 
- [x] Generalize layout system using `vd`
- [x] Make `vd` separate project and package? Or re-use hyperscript?
- [x] Revamp documentation

### Bugs

- [ ] Checkboxes in bootstrap 3
- [ ] Help text in bulma

