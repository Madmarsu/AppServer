# Buttons: Button

## Usage

```js
import { Button } from 'asc-web-components';
```

#### Description

Huge Button is used for a action on a page.

#### Usage

```js
<Button size='huge' disabled={false} onClick={() => alert('Button clicked')}>OK</Button>
```

#### Properties

| Props              | Type     | Required | Values                      | Default   | Description                                                                                                                                      |
| ------------------ | -------- | :------: | --------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `primary`          | `bool`   |    -     | -                           | -         | Tells when the button should be primary                                  |
| `disabled`         | `bool`   |    -     | -                           | -         | Tells when the button should present a disabled state                                  |
| `onClick`          | `func`   |    ✅    | -                           | -         | What the button will trigger when clicked                                              |
| `size`             | `oneOf`  |    -     | `base`, `middle`, `big`, `huge`             | `base`     | -                                                                     |
