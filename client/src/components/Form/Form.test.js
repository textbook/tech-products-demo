import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Form, { FormControls } from "./index";

describe("Form", () => {
	it("shows a submit button", () => {
		const submitButton = "Submit";
		render(<TestForm submitButton={submitButton} />);
		expect(screen.getByRole("button", { name: submitButton })).toHaveAttribute(
			"type",
			"submit"
		);
	});

	it("shows a reset button if specified", () => {
		const resetButton = "Reset";
		render(<TestForm resetButton={resetButton} />);
		expect(screen.getByRole("button", { name: resetButton })).toHaveAttribute(
			"type",
			"reset"
		);
	});

	it("calls onSubmit with the form data", async () => {
		const onSubmit = jest.fn();
		const user = userEvent.setup();
		render(
			<TestForm onSubmit={onSubmit}>
				<FormControls.Input label="Foo" name="foo" />
				<FormControls.Input label="Bar" name="bar" />
			</TestForm>
		);

		await user.type(screen.getByRole("textbox", { name: /foo/i }), "foo value");
		await user.click(screen.getByRole("button", { name: /submit/i }));

		expect(onSubmit).toHaveBeenCalledWith({ foo: "foo value", bar: "" });
	});

	it("resets the form when onSubmit resolves", async () => {
		const onSubmit = jest.fn().mockResolvedValue(undefined);
		const user = userEvent.setup();
		render(
			<TestForm onSubmit={onSubmit}>
				<FormControls.Input label="Foo" name="foo" />
			</TestForm>
		);

		await user.type(screen.getByRole("textbox", { name: /foo/i }), "foo value");
		await user.click(screen.getByRole("button", { name: /submit/i }));

		expect(screen.getByRole("textbox", { name: /foo/i })).toHaveValue("");
	});

	it("keeps the inputs if onSubmit rejects", async () => {
		const onSubmit = jest.fn().mockRejectedValue(new Error("whoops!"));
		const user = userEvent.setup();
		render(
			<TestForm onSubmit={onSubmit}>
				<FormControls.Input label="Foo" name="foo" />
			</TestForm>
		);

		await user.type(screen.getByRole("textbox", { name: /foo/i }), "foo value");
		await user.click(screen.getByRole("button", { name: /submit/i }));

		expect(screen.getByRole("textbox", { name: /foo/i })).toHaveValue(
			"foo value"
		);
	});
});

// eslint-disable-next-line react/prop-types
function TestForm({ children, ...overrides } = {}) {
	return (
		<Form
			label="Test form"
			onChange={jest.fn()}
			onSubmit={jest.fn()}
			submitButton="Submit"
			{...overrides}
		>
			{children ?? "Form content"}
		</Form>
	);
}
