INSERT INTO subjects (id, name)
SELECT CAST('11111111-1111-1111-1111-111111111111' AS UUID), 'Hindi'
WHERE NOT EXISTS (
    SELECT 1 FROM subjects WHERE name = 'Hindi'
);

INSERT INTO subjects (id, name)
SELECT CAST('22222222-2222-2222-2222-222222222222' AS UUID), 'Mathematics'
WHERE NOT EXISTS (
    SELECT 1 FROM subjects WHERE name = 'Mathematics'
);

INSERT INTO curricula (id, name, grade_level, subject_id, active)
SELECT
    CAST('31111111-1111-1111-1111-111111111111' AS UUID),
    'CBSE Grade 3 Hindi',
    'Grade 3',
    s.id,
    TRUE
FROM subjects s
WHERE s.name = 'Hindi'
  AND NOT EXISTS (
      SELECT 1
      FROM curricula c
      WHERE c.name = 'CBSE Grade 3 Hindi'
        AND c.grade_level = 'Grade 3'
        AND c.subject_id = s.id
  );

INSERT INTO curricula (id, name, grade_level, subject_id, active)
SELECT
    CAST('32222222-2222-2222-2222-222222222222' AS UUID),
    'CBSE Grade 3 Mathematics',
    'Grade 3',
    s.id,
    TRUE
FROM subjects s
WHERE s.name = 'Mathematics'
  AND NOT EXISTS (
      SELECT 1
      FROM curricula c
      WHERE c.name = 'CBSE Grade 3 Mathematics'
        AND c.grade_level = 'Grade 3'
        AND c.subject_id = s.id
  );

INSERT INTO curricula (id, name, grade_level, subject_id, active)
SELECT
    CAST('33333333-3333-3333-3333-333333333333' AS UUID),
    'Olympiad Mathematics',
    'Grade 3',
    s.id,
    TRUE
FROM subjects s
WHERE s.name = 'Mathematics'
  AND NOT EXISTS (
      SELECT 1
      FROM curricula c
      WHERE c.name = 'Olympiad Mathematics'
        AND c.grade_level = 'Grade 3'
        AND c.subject_id = s.id
  );
