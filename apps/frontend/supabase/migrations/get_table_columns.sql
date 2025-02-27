-- Create a function to get table columns
CREATE OR REPLACE FUNCTION public.get_table_columns(table_name text)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable boolean,
  column_default text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    column_name::text,
    data_type::text,
    (is_nullable = 'YES')::boolean as is_nullable,
    column_default::text
  FROM 
    information_schema.columns
  WHERE 
    table_schema = 'public'
    AND table_name = get_table_columns.table_name
  ORDER BY 
    ordinal_position;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.get_table_columns TO public; 