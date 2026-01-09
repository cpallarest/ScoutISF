// src/app/page.tsx
import Link from "next/link";
import { createClient } from "@/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  ArrowRight,
  FileText,
  LayoutGrid,
  Users,
  Target,
} from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-[calc(100vh-0px)] bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
              <span className="font-bold text-primary">S</span>
            </div>
            <div className="leading-tight">
              <div className="font-semibold">ScoutPro</div>
              <div className="text-xs text-muted-foreground">
                Scouting y toma de decisiones deportivas
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild>
                <Link href="/dashboard">
                  Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/sign-in">
                  Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-48 right-[-80px] h-[420px] w-[420px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-6 pt-16 pb-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Registro propio · Historial · Criterio
            </div>

            <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight">
              Scouting y toma de decisiones
              <br />
              <span className="text-primary">con contexto.</span>
            </h1>

            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl">
              Centraliza informes, jugadores, equipos y competiciones. Construye
              un historial útil: qué se observó, en qué contexto y qué
              conclusión se tomó.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild>
                <Link href={user ? "/dashboard" : "/sign-in"}>
                  Acceder al dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button size="lg" variant="outline" asChild>
                <Link href={user ? "/dashboard/reports/new" : "/sign-in"}>
                  Crear informe
                </Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Comentario técnico y veredicto
              </span>
              <span className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Historial por jugador
              </span>
              <span className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Flujo de trabajo claro
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-6 py-10">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Flujo de trabajo
            </h2>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              Un proceso sencillo para registrar partido, contexto y evaluación.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/60">
            <CardContent className="p-5">
              <div className="h-10 w-10 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-4 font-semibold">1) Crear informe</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Temporada y competición. El informe queda listo para trabajar,
                sin fricción.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-5">
              <div className="h-10 w-10 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                <LayoutGrid className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-4 font-semibold">2) Contexto táctico</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Alineaciones y roles para interpretar el entorno real del
                jugador.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-5">
              <div className="h-10 w-10 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-4 font-semibold">3) Evaluación</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Comentario, nota si la usas y veredicto. La conclusión queda
                explicada.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-5">
              <div className="h-10 w-10 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-4 font-semibold">4) Historial</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Accede a informes anteriores por jugador y mantén trazabilidad
                de decisiones.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Differentiator */}
      <section className="container mx-auto px-6 py-10">
        <Card className="border-border/60">
          <CardContent className="p-6 md:p-10">
            <div className="max-w-3xl">
              <div className="text-sm text-primary font-semibold">Enfoque</div>
              <h3 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight">
                Menos “plantilla”.
                <br />
                Más criterio registrado.
              </h3>
              <p className="mt-4 text-muted-foreground">
                El valor está en el contexto y en el comentario: qué se vio, en
                qué situación y qué impacto tuvo. Eso es lo que se consulta
                semanas o meses después.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button size="lg" asChild>
                  <Link href={user ? "/dashboard/reports/new" : "/sign-in"}>
                    Crear informe <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href={user ? "/dashboard/players" : "/sign-in"}>
                    Ver jugadores
                  </Link>
                </Button>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Próximo paso: incorporar capturas reales de tu entorno para que
                la home refleje la plataforma.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="container mx-auto px-6 py-8 flex flex-col sm:flex-row gap-3 items-center justify-between text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} ScoutPro</span>
          <span>Scouting · Historial · Decisión</span>
        </div>
      </footer>
    </main>
  );
}
