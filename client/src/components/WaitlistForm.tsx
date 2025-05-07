import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { waitlistSchema } from "@shared/schema";

interface WaitlistFormProps {
  onSuccess: () => void;
}

// Modified to only require email
const formSchema = waitlistSchema.pick({
  email: true,
}).extend({
  email: z.string().email("Adresse email invalide"),
});

type FormValues = z.infer<typeof formSchema>;

const WaitlistForm = ({ onSuccess }: WaitlistFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Add a default name since the form no longer collects it
      const submitData = { ...data, name: "Utilisateur" };
      await apiRequest("POST", "/api/waitlist", submitData);
      reset();
      onSuccess();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div className="relative mb-4">
          <input
            type="email"
            id="email"
            placeholder="Votre adresse email"
            className={`w-full py-4 px-6 bg-white/[0.08] border ${
              errors.email ? "border-red-500" : "border-white/20"
            } rounded-full text-white text-base transition-all focus:outline-none focus:border-white`}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1 ml-3">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 bg-white text-black rounded-full text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Chargement..." : "Rejoindre la liste d'attente"}
        </button>
      </form>
    </div>
  );
};

export default WaitlistForm;
