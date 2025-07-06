"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Pencil, Plus, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

const ClashesPage = () => {
  const [clashes, setClashes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchClashes = async () => {
      fetch("/api/clashes")
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setClashes(data.clashes);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
        });
    };
    fetchClashes();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-row gap-2">
        <Button
          className="w-fit bg-blue-50 text-blue-600 hover:bg-blue-100"
          asChild
        >
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </Button>
        <Button
          className="w-fit"
          onClick={() => router.push("/dashboard/create")}
        >
          <Plus className="w-4 h-4" />
          Create New AB Clash
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Clashes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                {clashes.map((clash) => (
                  <div className="flex flex-row gap-2">
                    <div className="flex flex-col gap-2 w-full">
                      <h3 className="text-lg font-medium">{clash.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {clash.description}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-muted-foreground">
                        {clash.created_at}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-muted-foreground">
                        {clash.status}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-muted-foreground">
                        {clash.show_cta ? "Yes" : "No"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {clash.options.map((option: any) => (
                        <div className="flex flex-col gap-2">
                          <p className="text-sm text-muted-foreground">
                            {option.text}
                          </p>
                          <Image
                            src={option.image_url}
                            alt={option.text}
                            width={100}
                            height={100}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex  gap-2">
                  <p className="text-sm font-medium">Actions:</p>
                  <Button onClick={() => router.push(`/dashboard/view/${clash.id}`)}>View</Button>
                  <Button variant="outline" onClick={() => router.push(`/dashboard/edit/${clash.id}`)}>
                    <Pencil className="w-4 h-4" />
                    </Button>
                  <Button variant="destructive" onClick={() => handleDelete(clash.id)}>
                    <Trash className="w-4 h-4" />
                    </Button>
                </div>
                  </div>
                ))}
                {clashes.length === 0 && (
                  <>
                    <div className="flex justify-center items-center flex-col gap-4 mx-auto">
                      <p className="text-muted-foreground">No clashes found</p>
                      <Button
                        className="w-full"
                        onClick={() => router.push("/dashboard/create")}
                      >
                        Create New Clash
                      </Button>
                    </div>
                  </>
                )}
                
              </div>
              
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClashesPage;
