-- Drop all constraints and policies first
DROP POLICY IF EXISTS "equipment_policy" ON equipment;
DROP POLICY IF EXISTS "equipment_select_policy" ON equipment;
DROP POLICY IF EXISTS "equipment_access_policy" ON equipment;
DROP POLICY IF EXISTS "service_records_policy" ON service_records;
DROP POLICY IF EXISTS "service_records_select_policy" ON service_records;
DROP POLICY IF EXISTS "service_records_access_policy" ON service_records;
DROP POLICY IF EXISTS "conversations_policy" ON conversations;
DROP POLICY IF EXISTS "conversations_select_policy" ON conversations;
DROP POLICY IF EXISTS "conversations_access_policy" ON conversations;

-- Update equipment table
ALTER TABLE equipment DROP CONSTRAINT IF EXISTS equipment_customer_id_fkey;
ALTER TABLE equipment RENAME COLUMN customer_id TO company_id;
ALTER TABLE equipment ADD CONSTRAINT equipment_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_equipment_company_id ON equipment(company_id);

-- Update service_records table
ALTER TABLE service_records DROP CONSTRAINT IF EXISTS service_records_customer_id_fkey;
ALTER TABLE service_records RENAME COLUMN customer_id TO company_id;
ALTER TABLE service_records ADD CONSTRAINT service_records_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_service_records_company_id ON service_records(company_id);

-- Update conversations table
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_customer_id_fkey;
ALTER TABLE conversations RENAME COLUMN customer_id TO company_id;
ALTER TABLE conversations ADD CONSTRAINT conversations_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_conversations_company_id ON conversations(company_id);

-- Update conversation_participants table
ALTER TABLE conversation_participants DROP CONSTRAINT IF EXISTS conversation_participants_customer_id_fkey;
ALTER TABLE conversation_participants RENAME COLUMN customer_id TO company_id;
ALTER TABLE conversation_participants ADD CONSTRAINT conversation_participants_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_conversation_participants_company_id ON conversation_participants(company_id);

-- Update messages table
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_customer_id_fkey;
ALTER TABLE messages RENAME COLUMN customer_id TO company_id;
ALTER TABLE messages ADD CONSTRAINT messages_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_messages_company_id ON messages(company_id);

-- Update policies to use company_id
CREATE POLICY "equipment_policy" ON equipment
  USING (company_id = auth.uid());

CREATE POLICY "service_records_policy" ON service_records
  USING (company_id = auth.uid());

CREATE POLICY "conversations_policy" ON conversations
  USING (company_id = auth.uid());

CREATE POLICY "conversation_participants_policy" ON conversation_participants
  USING (company_id = auth.uid());

CREATE POLICY "messages_policy" ON messages
  USING (company_id = auth.uid());

-- Grant permissions
GRANT ALL ON equipment TO authenticated;
GRANT ALL ON service_records TO authenticated;
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON conversation_participants TO authenticated;
GRANT ALL ON messages TO authenticated; 