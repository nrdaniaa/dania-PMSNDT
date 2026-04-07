'Use Client'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function AlertTaskDue() {
    return(
        <div className="flex justify-center">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">
                        View Task Detail
                        </button>
                    </AlertDialogTrigger>
                    
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>This Task has been past the Due Date</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please update and inform the Manager
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                        <AlertDialogAction>Open Task</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}