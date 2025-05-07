import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { waitlistSchema } from "@shared/schema";

interface WaitlistFormProps {
  onSuccess: () => void;
}

const formSchema = waitlistSchema.extend({
  name: z.string().min(2, "Le nom est requis"),
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
      name: "",
      email: "",
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/waitlist", data);
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
    <motion.div
      className="form-container flex flex-col justify-center items-start col-span-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.6, duration: 0.8 }}
    >
      <div className="form-label text-xs uppercase tracking-widest mb-5 opacity-70">
        Accès en avant-première
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="form w-full max-w-md">
        <div className="form-group relative mb-6">
          <input
            type="text"
            id="name"
            placeholder="Votre nom"
            className={`form-input w-full py-5 px-8 bg-white/[0.03] border ${
              errors.name ? "border-red-500" : "border-white/10"
            } rounded-full text-white text-base font-light transition-all duration-500 focus:outline-none focus:border-[var(--gold)] focus:bg-white/[0.05] focus:animate-pulse-glow`}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1 ml-3">{errors.name.message}</p>
          )}
        </div>

        <div className="form-group relative mb-8">
          <input
            type="email"
            id="email"
            placeholder="Votre adresse email"
            className={`form-input w-full py-5 px-8 bg-white/[0.03] border ${
              errors.email ? "border-red-500" : "border-white/10"
            } rounded-full text-white text-base font-light transition-all duration-500 focus:outline-none focus:border-[var(--gold)] focus:bg-white/[0.05] focus:animate-pulse-glow`}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1 ml-3">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="submit-btn w-full py-5 px-8 bg-transparent border border-[var(--gold)] rounded-full text-[var(--gold)] text-sm font-medium tracking-widest uppercase transition-all duration-500 hover:bg-[var(--gold)] hover:text-black relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Chargement..." : "Rejoindre la liste d'attente"}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000"></span>
        </button>
      </form>
    </motion.div>
  );
};

export default WaitlistForm;
