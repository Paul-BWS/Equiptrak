import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Save, Plus, Trash2, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

interface Note {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  company_id: string;
  note_type: 'admin' | 'user';
}

export interface NotesRef {
  toggleAddNote: () => void;
  reloadNotes: () => void;
}

interface NotesProps {
  companyId: string;
  isAdmin?: boolean;
  hideHeader?: boolean;
}

export const Notes = forwardRef<NotesRef, NotesProps>(({
  companyId,
  isAdmin = false,
  hideHeader = false
}, ref) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Update the fetchNotes function with more comprehensive debugging
  const fetchNotes = useCallback(async () => {
    if (!companyId || !user) {
      console.log(`Cannot fetch notes: ${!companyId ? 'Missing companyId' : 'Missing user'}`);
      return;
    }
    
    console.log(`Fetching notes for company ID: ${companyId}`);
    setIsLoading(true);
    
    try {
      console.log(`Making API request with token: ${user.token.substring(0, 10)}...`);
      
      // Create a complete URL with the current port
      const baseUrl = window.location.origin;
      const apiUrl = `${baseUrl}/api/companies/${companyId}/notes`;
      
      console.log(`Making GET request to: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      console.log(`API response status: ${response.status}`);
      
      if (response.ok) {
        const fetchedNotes = await response.json();
        console.log(`Successfully fetched ${fetchedNotes.length} notes:`, fetchedNotes);
        
        // Make sure notes have a valid note_type, defaulting to 'user' if missing
        const processedNotes = fetchedNotes.map(note => ({
          ...note,
          note_type: note.note_type || 'user' // Default to user type if missing
        }));
        
        console.log(`After processing, ${processedNotes.length} notes:`, processedNotes);
        setNotes(processedNotes);
      } else {
        console.error(`Failed to fetch notes: ${response.status}`);
        if (response.status === 404) {
          // If the endpoint doesn't exist, just use an empty array
          setNotes([]);
        } else {
          // For other errors, try to get the error message
          const errorText = await response.text();
          console.error(`Error details: ${errorText}`);
          toast({
            title: "Error",
            description: `Failed to load notes: ${response.status}`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast({
        title: "Error",
        description: "Failed to load notes. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [companyId, user]);

  useEffect(() => {
    if (companyId) {
      fetchNotes();
    }
  }, [fetchNotes, companyId]);

  // Add a new note
  const handleAddNote = async () => {
    if (!newNote.trim() || !user) return;
    
    try {
      // Determine note type based on user role
      const noteType = user.role === 'admin' ? 'admin' : 'user';
      
      const response = await fetch(`/api/companies/${companyId}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newNote,
          note_type: noteType
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to add note');
      }
      
      const newNoteData = await response.json();
      
      // Add the new note to the list
      setNotes([...notes, newNoteData]);
      
      // Clear the input and hide the form
      setNewNote("");
      setIsAddingNote(false);
      
      toast({
        title: "Success",
        description: "Note added successfully",
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Update an existing note
  const handleUpdateNote = async (noteId: string) => {
    if (!editingContent.trim() || !user) return;
    
    try {
      const response = await fetch(`/api/companies/${companyId}/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: editingContent
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to update note');
      }
      
      const updatedNote = await response.json();
      
      // Update the note in the list
      setNotes(notes.map(note => note.id === noteId ? updatedNote : note));
      
      // Clear editing state
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
      const response = await fetch(`/api/companies/${companyId}/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete note');
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
    return user.role === 'admin' || note.created_by === user.id;
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

  // Sort notes by created_at (newest first)
  const sortedNotes = [...notes].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Expose the toggleAddNote function to the parent
  useImperativeHandle(ref, () => ({
    toggleAddNote: () => setIsAddingNote(!isAddingNote),
    reloadNotes: fetchNotes
  }));

  return (
    <div className="w-full">
      {!hideHeader && (
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center">
            <MessageCircle className="mr-2 h-5 w-5 text-primary" />
            Notes
          </h2>
          <Button 
            onClick={() => setIsAddingNote(!isAddingNote)}
            variant="secondary"
            size="sm"
          >
            {isAddingNote ? 'Cancel' : (
              <>
                <Plus className="mr-1 h-4 w-4" />
                Add Note
              </>
            )}
          </Button>
        </div>
      )}
      
      {isAddingNote && (
        <Card className="border border-primary/20 bg-primary/5 mb-4">
          <CardContent className="pt-4">
            <Textarea
              placeholder="Write a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="mb-2"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsAddingNote(false);
                  setNewNote("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="default" 
                size="sm"
                onClick={handleAddNote}
                className="bg-a6e15a text-black hover:bg-opacity-90"
              >
                <Save className="mr-1 h-4 w-4" />
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
        </div>
      ) : sortedNotes.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground bg-muted/20 rounded-md">
          <p>No notes available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedNotes.map(note => (
            <div key={note.id} className="relative border rounded-md p-3 shadow-sm bg-background">
              {editingNoteId === note.id ? (
                <>
                  <Textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="mb-2"
                  />
                  <div className="flex justify-end gap-2">
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
                      className="bg-a6e15a text-black hover:bg-opacity-90"
                    >
                      <Save className="mr-1 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm">{note.content}</p>
                  <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                    <span>
                      {note.note_type === 'admin' ? '👨‍💼 Admin' : '👤 User'} • {formatDate(note.created_at)}
                    </span>
                    {canEditNote(note) && (
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingNoteId(note.id);
                            setEditingContent(note.content);
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}); 