/**
 * SearchBar Component
 * 
 * Search input component with auto-complete and suggestions
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Keyboard,
  Alert,
} from 'react-native';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear?: () => void;
  placeholder?: string;
  initialValue?: string;
  suggestions?: string[];
  isLoading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onClear,
  placeholder = 'Search images...',
  initialValue = '',
  suggestions = [],
  isLoading = false,
}) => {
  const [query, setQuery] = useState(initialValue);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = useCallback(() => {
    if (!query.trim()) {
      Alert.alert('Empty Search', 'Please enter a search query');
      return;
    }

    Keyboard.dismiss();
    setShowSuggestions(false);
    onSearch(query.trim());
  }, [query, onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    setShowSuggestions(false);
    Keyboard.dismiss();
    if (onClear) {
      onClear();
    }
  }, [onClear]);

  const handleSuggestionPress = useCallback((suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  }, [onSearch]);

  const handleTextChange = useCallback((text: string) => {
    setQuery(text);
    setShowSuggestions(text.length > 0 && suggestions.length > 0);
  }, [suggestions.length]);

  const handleFocus = useCallback(() => {
    if (query.length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [query.length, suggestions.length]);

  const handleBlur = useCallback(() => {
    // Delay hiding suggestions to allow suggestion tap
    setTimeout(() => setShowSuggestions(false), 150);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#999"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          editable={!isLoading}
        />
        
        <View style={styles.buttonContainer}>
          {query.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              disabled={isLoading}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={isLoading || !query.trim()}
          >
            <Text style={[styles.searchButtonText, isLoading && styles.searchButtonTextDisabled]}>
              {isLoading ? '⏳' : '🔍'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    padding: 8,
    marginRight: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999',
  },
  searchButton: {
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    minWidth: 36,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#ccc',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchButtonTextDisabled: {
    color: '#999',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    maxHeight: 200,
    zIndex: 1001,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
});

export default SearchBar;
