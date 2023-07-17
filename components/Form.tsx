import { PageProps } from "$fresh/server.ts";
import { ZodObject } from "z";

type FormProps = PageProps<
  { schema: ZodObject<any, any, any>; modelName: string }
>;

export default function Form(props: FormProps) {
  const schema = props.data.schema;
  return (
    <div>
      <form method="post" action={`/${props.data.modelName}`}>
        {Object.keys(schema.shape).map((key) => (
          <div key={key}>
            <label>{key}</label>
            <input name={key} defaultValue={""} />
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
