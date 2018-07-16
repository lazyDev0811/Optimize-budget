<?php

Abstract Class AbstractReader {

    protected $fileHandle = NULL;
    
    protected $sheets = array();

    protected function openFile($filename) {
        if (!file_exists($filename) || !is_readable($filename)) {
            throw new Exception("Could not open " . $filename . " for reading! File does not exist.");
        }

        // Open file
        $this->fileHandle = fopen($filename, 'r');
        if ($this->fileHandle === FALSE) {
            throw new Exception("Could not open file " . $filename . " for reading.");
        }
    }

    public function canRead($filename) {
        try {
            $this->openFile($filename);
        } 
        catch (Exception $e) 
        {
          echo $e->getMessage();
            return FALSE;
        }

        $readable = $this->isValidFormat($filename);
        fclose($this->fileHandle);
        return $readable;
    }
    
}