import { PageProps } from "$fresh/server.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

interface FormProps extends PageProps {
  model: z.ZodObject<any, any, any>;
  modelName: string;
}

export default function Form(props: FormProps) {
  const schema = props.data.schema as any as z.ZodObject<any, any, any>;
  const test = Object.keys(schema.shape);
  const item = props.data.item;
  return (
    <div>
      <form method="post" action={`/${props.data.modelName}`}>
        {Object.keys(schema.shape).map((key) => (
          <div key={key}>
            <label>{key}</label>
            <input name={key} defaultValue={item ? item[key] : ""} />
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
      {item && (
        <div>
          <h2>Submitted Data:</h2>
          <pre>{JSON.stringify(item, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
