"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, LineChart, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const ViewClashPage = () => {
  const { clashId } = useParams();
  const router = useRouter();
  const [clash, setClash] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  console.log(clashId);

  useEffect(() => {
    const fetchClash = async () => {
      const response = await fetch(`/api/clashes/${clashId}`);
      const data = await response.json();
      console.log(data);
      setClash(data);
      setLoading(false);
    };
    fetchClash();
  }, [clashId]);

  const handleDelete = async () => {
    setDeleting(true);
    const response = await fetch(`/api/clashes/${clashId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      toast.success("Clash deleted");
      router.push("/dashboard/clashes");
    } else {
      toast.error("Failed to delete clash");
    }
    setDeleting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          className="w-fit bg-blue-50 text-blue-600 hover:bg-blue-100"
          asChild
        >
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">View Clash</h1>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}

      {!loading && !clash ? (
        <div className="flex justify-center items-center h-full">
          <p className="text-sm text-muted-foreground">
            Clash not found or deleted
          </p>
        </div>
      ) : (
        <>
        {clash && (
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">{clash.title}</h1>
                <p className="text-sm text-muted-foreground">{clash.description}</p>
                <div className="flex flex-row gap-2">
                    <Badge variant="outline">{clash.status}</Badge>
                    <Badge variant="outline">{clash.expires_at ? new Date(clash.expires_at).toLocaleString() : "-"}</Badge>
                </div>
                <div className="flex flex-row gap-2">
                    <Button variant="outline">Edit</Button>
                    <Button variant="destructive" onClick={() => setOpen(true)}>Delete</Button>
                </div>
                <div className="flex flex-row gap-2">
                    CTA Text: {clash.cta_text}
                </div>
                <div className="flex flex-row gap-2">
                    CTA URL: {clash.cta_url}
                </div>
                <div className="flex flex-row gap-2">
                    {clash.options.map((option: any, idx: number) => (
                        <div className="flex flex-row gap-2" key={idx}>
                            <Image src={option.image_url} alt={option.text} width={100} height={100} />
                            <p className="text-sm font-medium">{option.text}</p>
                        </div>
                    ))}
                </div>
                <div className="flex flex-row gap-2">
                    Total Views: {clash.total_views}
                </div>
                <div className="flex flex-row gap-2">
                    Total Votes: {clash.total_votes}
                </div>
                <div className="flex flex-row gap-2">
                    trends over time and date :
                    <LineChart className="w-4 h-4"/>
                </div>
               
            </div>
        )

        }
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. All analytics and everything related to this <u className=" text-destructive">clash will be deleted</u>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="text-white bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
      )}
    </div>
  );
};

export default ViewClashPage;
