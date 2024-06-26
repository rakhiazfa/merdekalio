import { useAuth } from "@/services/auth/auth.hook";
import { SignInPayload } from "@/services/auth/auth.types";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";

const schema = yup
    .object({
        email: yup
            .string()
            .email("Email must be a valid email.")
            .required("Email is a required field."),
        password: yup
            .string()
            .required("Password is a required field.")
            .min(8, "Password must be at least ${min} characters."),
    })
    .required();

const SignIn = () => {
    const navigate = useNavigate();
    const { signIn, loading, errors: authErrors } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignInPayload>({
        resolver: yupResolver(schema),
    });

    const onSubmit: SubmitHandler<SignInPayload> = async (
        data: SignInPayload
    ) => {
        const isSuccess = await signIn(data);

        if (isSuccess) {
            navigate("/");
        }
    };

    return (
        <div className="min-h-[525px] flex justify-center items-center">
            <div className="w-[350px] bg-white border border-gray-300 shadow-xxs rounded-md px-7 pt-10 pb-7">
                <h2 className="text-xl font-semibold mb-5">Masuk</h2>
                <p className="text-[0.8rem] text-gray-600 mb-5">
                    Selamat datang, silahkan masukan kredensial anda untuk
                    melanjutkan.
                </p>
                {authErrors?.unauthenticated ? (
                    <span className="block text-xs text-red-500 mb-5">
                        {authErrors?.unauthenticated}
                    </span>
                ) : null}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="grid grid-cols-1 gap-y-5"
                >
                    <Input
                        label="Email"
                        type="text"
                        {...register("email")}
                        isInvalid={!!errors?.email}
                        errorMessage={errors?.email?.message}
                        variant="bordered"
                    />
                    <Input
                        label="Kata Sandi"
                        type="password"
                        {...register("password")}
                        isInvalid={!!errors?.password}
                        errorMessage={errors?.password?.message}
                        variant="bordered"
                    />
                    <div className="flex justify-end mt-2">
                        <Button
                            type="submit"
                            size="sm"
                            color="primary"
                            disabled={loading}
                        >
                            Sign In
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignIn;
