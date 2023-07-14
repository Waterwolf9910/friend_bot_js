import { ComponentStory, ComponentMeta } from "@storybook/react"
let React: typeof import("react") = require("react")
// let reactStory: typeof import("@storybook/react") = require("@storybook/react")
let MyButton: typeof import("./MyButton") = require("./MyButton")

let buttonArgs: typeof Button.ButtonOptions = {
    backgroundColor: "bisque",
    color: "maroon",
    name: "Button",
    onClick: () => {console.log("A")},
    primary: false,
    height: 12,
    length: 20
}
export default {
    title: "Main/MyButton",
    component: MyButton.Button,
    args: buttonArgs,
    argTypes: { onClick: { action: "clicked" }, height: { control: { type: "range", min: 0, step: 1 } }, length: { control: { type: "range", min: 0, step: 1 } } }
} as ComponentMeta<typeof MyButton.Button>

let template: ComponentStory<typeof MyButton.Button> = (args) => <MyButton.Button {...args}/>

export let Button = template.bind({});
// Button.args = buttonArgs
