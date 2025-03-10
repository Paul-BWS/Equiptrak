import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Save, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Note {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  company_id: string;
}

interface NotesProps {
  companyId: string;
  isAdmin?: boolean;
  hideHeader?: boolean;
}

export function Notes({
  companyId,
  isAdmin = false,
  hideHeader = false
}: NotesProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const { toast } = useToast();

  console.log('Notes component rendered:', { companyId, isAdmin, user: !!user, hideHeader });

  // Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      if (!companyId || !user) {
        console.log('Missing companyId or user, skipping fetch');
        return;
      }
      
      setIsLoading(true);
      try {
        console.log('Fetching notes for company:', companyId);
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching notes:', error);
          toast({
            title: "Error",
            description: "Failed to load notes. Please try again.",
            variant: "destructive"
          });
          return;
        }
        
        console.log('Notes fetched successfully:', data);
        setNotes(data || []);
      } catch (error) {
        console.error('Error fetching notes:', error);
        toast({
          title: "Error",
          description: "Failed to load notes. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (companyId && user) {
      fetchNotes();
    }
  }, [companyId, user, toast]);

  // Add a new note
  const handleAddNote = async () => {
    if (!newNote.trim() || !user || !companyId) {
      console.error('Missing required data:', { 
        noteContent: !!newNote.trim(), 
        user: !!user, 
        companyId: !!companyId 
      });
      toast({
        title: "Error",
        description: "Missing required information. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log('Adding note for company:', companyId);
      console.log('Current user:', user.id);
      
      // Create a new note object
      const newNoteObj = {
        content: newNote,
        company_id: companyId,
        created_by: user.id
      };
      
      console.log('New note object:', newNoteObj);
      
      // Insert the note
      const { data, error } = await supabase
        .from('notes')
        .insert(newNoteObj)
        .select();
        
      if (error) {
        console.error('Error adding note:', error);
        toast({
          title: "Error",
          description: `Failed to add note: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      console.log('Note added successfully:', data);
      
      // Add the new note to the list
      if (data && data.length > 0) {
        setNotes([data[0], ...notes]);
        setNewNote("");
        setIsAddingNote(false);
        
        toast({
          title: "Success",
          description: "Note added successfully",
        });
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Update a note
  const handleUpdateNote = async (noteId: string) => {
    if (!editingContent.trim() || !user) return;
    
    try {
      const { error } = await supabase
        .from('notes')
        .update({ content: editingContent })
        .eq('id', noteId);
        
      if (error) {
        console.error('Error updating note:', error);
        toast({
          title: "Error",
          description: "Failed to update note. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Update the note in the list
      setNotes(notes.map(note => 
        note.id === noteId ? { ...note, content: editingContent } : note
      ));
      
      setEditingNoteId(null);
      setEditingContent("");
      
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: "Failed to update note. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Delete a note
  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);
        
      if (error) {
        console.error('Error deleting note:', error);
        toast({
          title: "Error",
          description: "Failed to delete note. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Remove the note from the list
      setNotes(notes.filter(note => note.id !== noteId));
      
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Check if user can edit a note (admin can edit all, users can edit their own)
  const canEditNote = (note: Note) => {
    if (!user) return false;
    return isAdmin || note.created_by === user.id;
  };

  if (!user) {
    return (
      <div className="w-full">
        <p className="text-center text-muted-foreground py-4">
          Please log in to view notes.
        </p>
      </div>
    );
  }

  // Function to toggle adding note - can be called from parent
  const toggleAddNote = () => {
    setIsAddingNote(!isAddingNote);
  };

  // Expose the toggleAddNote function to the window object
  if (typeof window !== 'undefined') {
    (window as any).toggleAddNote = toggleAddNote;
  }

  const notesContent = (
    <>
      {isAddingNote && (
        <div className="mb-4">
          <Textarea
            placeholder="Enter your note here..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="mb-2"
            rows={3}
          />
          <div className="flex justify-end">
            <Button onClick={handleAddNote}>
              <Save className="h-4 w-4 mr-1" /> Save Note
            </Button>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center py-4">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-2"></div>
          <p>Loading notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          <p>No notes yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="border rounded-md p-3">
              {editingNoteId === note.id ? (
                <>
                  <Textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="mb-2"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setEditingNoteId(null);
                        setEditingContent("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleUpdateNote(note.id)}
                    >
                      <Save className="h-4 w-4 mr-1" /> Save
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-xs text-muted-foreground">{formatDate(note.created_at)}</div>
                    {canEditNote(note) && (
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            setEditingNoteId(note.id);
                            setEditingContent(note.content);
                          }}
                          title="Edit"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteNote(note.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );

  // If hideHeader is true, just return the content
  if (hideHeader) {
    return <div className="w-full">{notesContent}</div>;
  }

  // Otherwise, return the content wrapped in a Card with header
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Notes</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleAddNote}
          id="notes-add-button"
        >
          {isAddingNote ? "Cancel" : <><Plus className="h-4 w-4 mr-1" /> Add Note</>}
        </Button>
      </CardHeader>
      <CardContent>
        {notesContent}
      </CardContent>
    </Card>
  );
}

export default Notes; 