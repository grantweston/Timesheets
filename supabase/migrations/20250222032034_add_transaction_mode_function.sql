-- Create function to set transaction mode
CREATE OR REPLACE FUNCTION set_transaction_mode(mode text)
RETURNS void AS $$
BEGIN
  -- Validate mode parameter
  IF mode NOT IN ('read write', 'read only') THEN
    RAISE EXCEPTION 'Invalid transaction mode. Must be "read write" or "read only"';
  END IF;
  
  -- Set the transaction mode
  EXECUTE 'SET TRANSACTION ' || mode;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

-- Grant execute permission to authenticated and anon roles
GRANT EXECUTE ON FUNCTION set_transaction_mode(text) TO authenticated;
GRANT EXECUTE ON FUNCTION set_transaction_mode(text) TO anon;

-- Create function to get connection info
CREATE OR REPLACE FUNCTION get_connection_info()
RETURNS json AS $$
BEGIN
  RETURN json_build_object(
    'role', current_user,
    'database', current_database(),
    'transaction_read_only', current_setting('transaction_read_only'),
    'session_user', session_user,
    'application_name', current_setting('application_name')
  );
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

-- Grant execute permission to authenticated and anon roles
GRANT EXECUTE ON FUNCTION get_connection_info() TO authenticated;
GRANT EXECUTE ON FUNCTION get_connection_info() TO anon; 