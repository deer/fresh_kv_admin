// Form.tsx
import { PageProps } from "$fresh/server.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

interface FormData {
  [key: string]: string;
}

interface FormProps extends PageProps<FormData> {
  model: z.ZodObject<any, any, any>;
}

export default function Form(props: FormProps) {
  const model = props.data.model as any as z.ZodObject<any, any, any>;
  const test = Object.keys(model.shape);
//   const test2 = model.shape();
  return (
    <form method="post">
      {Object.keys(model.shape).map((key) => (
        <div key={key}>
          <label>{key}</label>
          <input name={key} value={props.data[key]} />
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
}
